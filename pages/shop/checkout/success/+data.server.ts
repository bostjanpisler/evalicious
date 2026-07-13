import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { auth } from "@/server/lib/auth";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import { getStripe } from "@/server/lib/stripe";

export type Data = {
	productName: string;
	productType: string;
	courseSlug?: string;
	orderId?: string;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const headers = (pageContext as Record<string, unknown>).headersOriginal as Headers | undefined;
	const authSession = headers ? await auth.api.getSession({ headers }) : null;
	if (!authSession?.user) {
		throw redirect(`/login?redirect=${encodeURIComponent(pageContext.urlOriginal)}`);
	}

	const url = new URL(pageContext.urlOriginal, "http://localhost");
	const sessionId = url.searchParams.get("session_id");

	if (!sessionId) {
		return { productName: "", productType: "" };
	}

	try {
		const session = await getStripe().checkout.sessions.retrieve(sessionId);
		const { productSlug, productType } = session.metadata ?? {};
		if (session.metadata?.userId !== authSession.user.id) {
			return { productName: "", productType: "" };
		}

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
			where: {
				stripeSessionId: sessionId,
				userId: authSession.user.id,
			},
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
