import { Hono } from "hono";
import type Stripe from "stripe";
import { db } from "../lib/db.js";
import { enqueueOrderInvoice } from "../lib/invoice-worker.js";
import { fulfillOrder } from "../lib/order-fulfillment.js";
import { sanityClient } from "../lib/sanity.js";
import { getStripe } from "../lib/stripe.js";
import { requireAuth } from "../middleware/guard.js";

type StripeVariables = {
	user: { id: string; email: string };
};

export const stripeHandler = new Hono<{ Variables: StripeVariables }>();

// Create checkout session
stripeHandler.post("/checkout", requireAuth, async (c) => {
	const user = c.get("user");
	const { productSlug } = await c.req.json<{ productSlug: string }>();

	const product = await db.product.findUnique({ where: { slug: productSlug } });
	if (!product || !product.published || product.priceInCents <= 0) {
		return c.json({ error: "Product does not require checkout" }, 400);
	}
	if (!product.stripePriceId || !product.stripeProductId) {
		return c.json({ error: "Product not found" }, 404);
	}
	const publishedProduct = await sanityClient.fetch<{ _id: string }>(
		`*[_type == "product" && _id == $id && published == true][0]{ _id }`,
		{ id: product.sanityId },
	);
	if (!publishedProduct) {
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
		if (session.payment_status !== "paid") {
			return c.json({ received: true });
		}
		const { userId, productId } = session.metadata ?? {};

		if (!userId || !productId) {
			return c.json({ error: "Missing metadata" }, 400);
		}

		const product = await db.product.findUnique({ where: { id: productId } });
		if (!product) return c.json({ error: "Product not found" }, 400);

		const order = await db.order.upsert({
			where: { stripeSessionId: session.id },
			update: {},
			create: {
				userId,
				stripeSessionId: session.id,
				stripePaymentIntentId:
					typeof session.payment_intent === "string" ? session.payment_intent : null,
				status: "completed",
				totalInCents: session.amount_total ?? product.priceInCents,
				currency: session.currency?.toUpperCase() ?? product.currency,
				email: session.customer_details?.email ?? session.customer_email ?? "",
				spaceInvoiceNextTryAt: new Date(),
				items: {
					create: {
						productId: product.id,
						priceInCents: product.priceInCents,
					},
				},
			},
		});

		await enqueueOrderInvoice(order.id);
		await fulfillOrder(order.id);
	}

	return c.json({ received: true });
});
