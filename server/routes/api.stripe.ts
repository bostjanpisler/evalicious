import { Hono } from "hono";
import type Stripe from "stripe";
import { checkoutProductSlug, paymentMatchesProduct } from "../lib/checkout-validation.js";
import { db } from "../lib/db.js";
import { enqueueOrderFulfillment, processFulfillmentJob } from "../lib/fulfillment-worker.js";
import { enqueueOrderInvoice } from "../lib/invoice-worker.js";
import { deliveryConfigurationError, productSellabilityError } from "../lib/product-sellability.js";
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
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid checkout request" }, 400);
	}
	const productSlug = checkoutProductSlug(body);
	if (!productSlug) {
		return c.json({ error: "Invalid checkout request" }, 400);
	}

	const product = await db.product.findUnique({ where: { slug: productSlug } });
	if (!product || product.priceInCents <= 0) {
		return c.json({ error: "Product does not require checkout" }, 400);
	}
	const publishedProduct = await sanityClient.fetch<{ _id: string; courseId?: string }>(
		`*[_type == "product" && _id == $id && published == true][0]{ _id, "courseId": course._ref }`,
		{ id: product.sanityId },
	);
	if (!publishedProduct) {
		return c.json({ error: "Product not found" }, 404);
	}
	const sellabilityError = productSellabilityError(product, publishedProduct);
	if (sellabilityError) return c.json({ error: sellabilityError }, 409);
	const deliveryError = deliveryConfigurationError(product.type);
	if (deliveryError) return c.json({ error: deliveryError }, 503);
	const stripePriceId = product.stripePriceId;
	if (!stripePriceId) return c.json({ error: "Paid product is missing Stripe configuration" }, 409);

	const alreadyOwned =
		product.type === "ecourse" && publishedProduct.courseId
			? await db.courseAccess.findUnique({
					where: {
						userId_courseId: { userId: user.id, courseId: publishedProduct.courseId },
					},
				})
			: await db.order.findFirst({
					where: {
						userId: user.id,
						status: "completed",
						items: { some: { productId: product.id } },
					},
					select: { id: true },
				});
	if (alreadyOwned) return c.json({ error: "You already own this product" }, 409);

	const session = await getStripe().checkout.sessions.create(
		{
			mode: "payment",
			payment_method_types: ["card"],
			line_items: [{ price: stripePriceId, quantity: 1 }],
			success_url: `${process.env.BETTER_AUTH_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.BETTER_AUTH_URL}/shop/${productSlug}`,
			customer_email: user.email,
			metadata: {
				userId: user.id,
				productId: product.id,
				productSlug: product.slug,
				productType: product.type,
			},
		},
		{
			// Stripe retains idempotency results for roughly a day, matching Checkout's default lifetime.
			idempotencyKey: `checkout:${user.id}:${product.id}`,
		},
	);

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
		if (
			!paymentMatchesProduct(
				{ amountTotal: session.amount_total, currency: session.currency },
				product,
			)
		) {
			return c.json({ error: "Payment amount does not match product" }, 400);
		}

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

		await Promise.all([enqueueOrderInvoice(order.id), enqueueOrderFulfillment(order.id)]);
		await processFulfillmentJob(order.id);
	}

	return c.json({ received: true });
});
