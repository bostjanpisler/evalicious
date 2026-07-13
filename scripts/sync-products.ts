import "dotenv/config";
import { db } from "@/server/lib/db";
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
	published?: boolean;
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
		published
	}`,
);

let synced = 0;
let skipped = 0;

for (const product of products ?? []) {
	if (
		!product.slug ||
		!product.type ||
		product.priceInCents == null ||
		(product.priceInCents > 0 && (!product.stripePriceId || !product.stripeProductId))
	) {
		skipped += 1;
		console.warn(`Skipped ${product._id}: missing slug, type, price, or paid-product Stripe IDs.`);
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
		},
		update: {
			slug: product.slug,
			type: product.type,
			priceInCents: product.priceInCents,
			currency: product.currency ?? "EUR",
			stripePriceId: product.stripePriceId,
			stripeProductId: product.stripeProductId,
			r2FileKey: product.r2FileKey,
		},
	});
	synced += 1;
}

await db.$disconnect();
console.log(`Synced ${synced} product${synced === 1 ? "" : "s"}; skipped ${skipped}.`);
