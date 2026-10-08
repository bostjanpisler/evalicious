import { redirect } from "vike/abort";
import { localizePath } from "@/lib/i18n/paths";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { PageContextServer } from "vike/types";
import { auth } from "@/server/lib/auth";
import {
	type CheckoutConfirmationStatus,
	checkoutConfirmationStatus,
} from "@/server/lib/checkout-status";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import { getStripe } from "@/server/lib/stripe";

export type Data = {
	status: CheckoutConfirmationStatus;
	productName: string;
	productType: string;
	courseSlug?: string;
	orderId?: string;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const headers = (pageContext as unknown as Record<string, unknown>).headersOriginal as
		| Headers
		| undefined;
	const authSession = headers ? await auth.api.getSession({ headers }) : null;
	if (!authSession?.user) {
		throw redirect(
			`${localizePath("/login", locale)}?redirect=${encodeURIComponent(pageContext.urlOriginal)}`,
		);
	}

	const url = new URL(pageContext.urlOriginal, "http://localhost");
	const sessionId = url.searchParams.get("session_id");

	if (!sessionId) {
		return { status: "invalid", productName: "", productType: "" };
	}

	try {
		const session = await getStripe().checkout.sessions.retrieve(sessionId);
		const { productSlug, productType } = session.metadata ?? {};
		if (session.metadata?.userId !== authSession.user.id) {
			return { status: "invalid", productName: "", productType: "" };
		}
		if (checkoutConfirmationStatus(session.payment_status, false) === "invalid") {
			return { status: "invalid", productName: "", productType: "" };
		}

		if (!productSlug) {
			return { status: "invalid", productName: "", productType: productType ?? "" };
		}

		// Get product name from Sanity
		const product = await sanityClient.fetch<{
			title: string;
			courseSlug?: string;
		}>(
			`*[_type == "product" && published == true && slug.current == $slug][0]{
				"title": select($locale == "en" && defined(en.title) => en.title, title),
				"courseSlug": course->slug.current
			}`,
			{ slug: productSlug, locale },
		);

		// Get order ID for download
		const order = await db.order.findFirst({
			where: {
				stripeSessionId: sessionId,
				userId: authSession.user.id,
				status: "completed",
			},
			select: { id: true },
		});

		return {
			status: checkoutConfirmationStatus(session.payment_status, !!order),
			productName: product?.title ?? productSlug,
			productType: productType ?? "",
			courseSlug: product?.courseSlug,
			orderId: order?.id,
		};
	} catch {
		return { status: "invalid", productName: "", productType: "" };
	}
}
