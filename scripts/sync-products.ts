import "dotenv/config";
import { db } from "@/server/lib/db";
import { productSellabilityError } from "@/server/lib/product-sellability";
import { storedObjectSize, storeObject } from "@/server/lib/r2";
import { sanityClient } from "@/server/lib/sanity";

type SanityProduct = {
	_id: string;
	slug?: string;
	type?: string;
	priceInCents?: number;
	currency?: string;
	stripePriceId?: string;
	stripeProductId?: string;
	r2FileKey?: string;
	digitalFile?: { url: string; sha1hash: string; size: number };
	published?: boolean;
	courseId?: string;
};

const products = await sanityClient.fetch<SanityProduct[]>(
	`*[_type == "product" && defined(slug.current)]{
		_id,
		"slug": slug.current,
		type,
		priceInCents,
		currency,
		stripePriceId,
		stripeProductId,
		r2FileKey,
		"digitalFile": digitalFile.asset->{ url, sha1hash, size },
		published,
		"courseId": course._ref
	}`,
);

if (!products) {
	throw new Error("Unable to load products from Sanity; no database changes were made.");
}

/**
 * Ebooks keep their PDF as the Sanity "Digital File". Copy it into private
 * storage under a content-addressed key, so replacing the PDF in Sanity
 * publishes a new file on the next sync. An explicit File Key wins.
 */
async function resolveFileKey(product: SanityProduct): Promise<string | undefined> {
	if (product.r2FileKey || product.type !== "ebook" || !product.digitalFile) {
		return product.r2FileKey;
	}
	const { url, sha1hash, size } = product.digitalFile;
	const key = `ebooks/${product.slug}-${sha1hash.slice(0, 12)}.pdf`;
	if ((await storedObjectSize(key)) === size) return key;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to download ${product.slug} PDF from Sanity`);
	const bytes = new Uint8Array(await response.arrayBuffer());
	if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
		throw new Error(`${product.slug} Digital File is not a PDF`);
	}
	await storeObject(key, bytes, "application/pdf");
	console.log(`Stored ${key}`);
	return key;
}

let synced = 0;
let skipped = 0;
const synchronizedSanityIds: string[] = [];

for (const product of products ?? []) {
	product.r2FileKey = await resolveFileKey(product);
	if (!product.slug || !product.type || product.priceInCents == null) {
		skipped += 1;
		console.warn(`Skipped ${product._id}: missing slug, type, price, or paid-product Stripe IDs.`);
		continue;
	}
	const sellabilityError = productSellabilityError(
		{
			...product,
			published: product.published === true,
			priceInCents: product.priceInCents,
			type: product.type,
		},
		{ courseId: product.courseId },
	);
	if (product.published === true && sellabilityError) {
		skipped += 1;
		console.warn(`Skipped ${product._id}: ${sellabilityError}.`);
		continue;
	}

	await db.product.upsert({
		where: { sanityId: product._id },
		create: {
			sanityId: product._id,
			slug: product.slug,
			type: product.type,
			priceInCents: product.priceInCents,
			currency: product.currency ?? "EUR",
			stripePriceId: product.stripePriceId,
			stripeProductId: product.stripeProductId,
			r2FileKey: product.r2FileKey,
			courseId: product.courseId,
			published: product.published === true,
		},
		update: {
			slug: product.slug,
			type: product.type,
			priceInCents: product.priceInCents,
			currency: product.currency ?? "EUR",
			stripePriceId: product.stripePriceId,
			stripeProductId: product.stripeProductId,
			r2FileKey: product.r2FileKey,
			courseId: product.courseId,
			published: product.published === true,
		},
	});
	synchronizedSanityIds.push(product._id);
	synced += 1;
}

await db.product.updateMany({
	where: synchronizedSanityIds.length > 0 ? { sanityId: { notIn: synchronizedSanityIds } } : {},
	data: { published: false },
});

await db.$disconnect();
console.log(`Synced ${synced} product${synced === 1 ? "" : "s"}; skipped ${skipped}.`);
