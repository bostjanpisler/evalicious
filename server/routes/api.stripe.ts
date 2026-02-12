import { Hono } from "hono";
import { getStripe } from "../lib/stripe.js";
import { db } from "../lib/db.js";
import { getSignedDownloadUrl } from "../lib/r2.js";
import { sendPurchaseConfirmation } from "../lib/email.js";
import { sanityClient } from "../lib/sanity.js";
import { requireAuth } from "../middleware/guard.js";
import type Stripe from "stripe";

export const stripeHandler = new Hono();

// Create checkout session
stripeHandler.post("/checkout", requireAuth, async (c) => {
	const user = c.get("user") as { id: string; email: string };
	const { productSlug } = await c.req.json<{ productSlug: string }>();

	const product = await db.product.findUnique({ where: { slug: productSlug } });
	if (!product || !product.stripePriceId) {
		return c.json({ error: "Product not found" }, 404);
	}

	const session = await getStripe().checkout.sessions.create({
		mode: "payment",
		payment_method_types: ["card"],
		line_items: [{ price: product.stripePriceId, quantity: 1 }],
		success_url: `${process.env.BETTER_AUTH_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.BETTER_AUTH_URL}/shop/${productSlug}`,
		customer_email: user.email,
		metadata: {
			userId: user.id,
			productId: product.id,
			productSlug: product.slug,
			productType: product.type,
		},
	});

	return c.json({ url: session.url });
});

// Webhook handler
stripeHandler.post("/webhook", async (c) => {
	const body = await c.req.text();
	const signature = c.req.header("stripe-signature");

	if (!signature) {
		return c.json({ error: "Missing signature" }, 400);
	}

	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return c.json({ error: "Webhook not configured" }, 500);
	}

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
	} catch {
		return c.json({ error: "Invalid signature" }, 400);
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const { userId, productId, productType } = session.metadata ?? {};

		if (!userId || !productId) {
			return c.json({ error: "Missing metadata" }, 400);
		}

		const product = await db.product.findUnique({ where: { id: productId } });
		if (!product) return c.json({ error: "Product not found" }, 400);

		// Create order
		const order = await db.order.create({
			data: {
				userId,
				stripeSessionId: session.id,
				stripePaymentIntentId: session.payment_intent as string,
				status: "completed",
				totalInCents: session.amount_total ?? product.priceInCents,
				currency: product.currency,
				email: session.customer_email ?? "",
				items: {
					create: {
						productId: product.id,
						priceInCents: product.priceInCents,
					},
				},
			},
		});

		// Handle product-type-specific actions
		if (productType === "ebook") {
			// Fetch ebook file key from Sanity
			const sanityProduct = await sanityClient.fetch(
				`*[_type == "product" && _id == $id][0]{ "fileKey": digitalFile.asset->url }`,
				{ id: product.sanityId },
			);
			if (sanityProduct?.fileKey) {
				const downloadUrl = await getSignedDownloadUrl(sanityProduct.fileKey, 86400);
				await sendPurchaseConfirmation(
					session.customer_email ?? "",
					product.slug,
					downloadUrl,
				);
			}
		} else if (productType === "ecourse") {
			// Get course ID from Sanity product
			const sanityProduct = await sanityClient.fetch(
				`*[_type == "product" && _id == $id][0]{ "courseId": course._ref }`,
				{ id: product.sanityId },
			);
			if (sanityProduct?.courseId) {
				await db.courseAccess.create({
					data: {
						userId,
						courseId: sanityProduct.courseId,
					},
				});
			}
			await sendPurchaseConfirmation(session.customer_email ?? "", product.slug);
		}
	}

	return c.json({ received: true });
});
