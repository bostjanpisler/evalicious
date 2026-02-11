import type { PageContextServer } from "vike/types";
import { db } from "@/server/lib/db";
import { getStripe } from "@/server/lib/stripe";
import { sanityClient } from "@/server/lib/sanity";

export type Data = {
	productName: string;
	productType: string;
	courseSlug?: string;
	orderId?: string;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const url = new URL(pageContext.urlOriginal, "http://localhost");
	const sessionId = url.searchParams.get("session_id");

	if (!sessionId) {
		return { productName: "", productType: "" };
	}

	try {
		const session = await getStripe().checkout.sessions.retrieve(sessionId);
		const { productSlug, productType } = session.metadata ?? {};

		if (!productSlug) {
			return { productName: "", productType: productType ?? "" };
		}

		// Get product name from Sanity
		const product = await sanityClient.fetch<{
			title: string;
			courseSlug?: string;
		}>(
			`*[_type == "product" && slug.current == $slug][0]{
				title,
				"courseSlug": course->slug.current
			}`,
			{ slug: productSlug },
		);

		// Get order ID for download
		const order = await db.order.findFirst({
			where: { stripeSessionId: sessionId },
			select: { id: true },
		});

		return {
			productName: product?.title ?? productSlug,
			productType: productType ?? "",
			courseSlug: product?.courseSlug,
			orderId: order?.id,
		};
	} catch {
		return { productName: "", productType: "" };
	}
}
