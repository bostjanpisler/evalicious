import { db } from "./db.js";
import { sendPurchaseConfirmation } from "./email.js";
import { productSellabilityError } from "./product-sellability.js";
import { getSignedDownloadUrl } from "./r2.js";

const DELIVERY_URL_LIFETIME_SECONDS = 24 * 60 * 60;
const DELIVERY_URL_MIN_REMAINING_MS = 5 * 60_000;
const FULFILLMENT_LEASE_MS = 5 * 60_000;

export async function fulfillOrder(orderId: string, alreadyClaimed = false): Promise<void> {
	const now = new Date();
	const claim = alreadyClaimed
		? { count: 1 }
		: await db.order.updateMany({
				where: {
					id: orderId,
					status: "completed",
					fulfillmentCompletedAt: null,
					OR: [
						{ fulfillmentWorkingAt: null },
						{ fulfillmentWorkingAt: { lt: new Date(now.getTime() - FULFILLMENT_LEASE_MS) } },
					],
				},
				data: { fulfillmentWorkingAt: now },
			});
	if (claim.count === 0) {
		const state = await db.order.findUnique({
			where: { id: orderId },
			select: { fulfillmentCompletedAt: true },
		});
		if (state?.fulfillmentCompletedAt) return;
		throw new Error(`Order ${orderId} fulfillment is already in progress`);
	}

	const order = await db.order.findUnique({
		where: { id: orderId },
		include: { user: true, items: { include: { product: true } } },
	});
	if (!order) throw new Error(`Order ${orderId} not found`);
	if (order.status !== "completed") throw new Error(`Order ${orderId} is not completed`);
	if (order.fulfillmentCompletedAt) return;

	const item = order.items[0];
	if (!item) throw new Error(`Order ${orderId} has no items`);
	const email = order.email || order.user.email;

	try {
		if (item.product.type === "ecourse") {
			if (!item.product.courseId) {
				throw new Error(`Course product ${item.product.sanityId} has no linked course`);
			}
			const sellabilityError = productSellabilityError(item.product, item.product, {
				requirePublished: false,
			});
			if (sellabilityError) throw new Error(sellabilityError);
			await db.courseAccess.upsert({
				where: {
					userId_courseId: { userId: order.userId, courseId: item.product.courseId },
				},
				create: { userId: order.userId, courseId: item.product.courseId },
				update: {},
			});
			await sendPurchaseConfirmation(email, item.product.slug, undefined, `purchase-${order.id}`);
		} else if (item.product.type === "ebook") {
			const sellabilityError = productSellabilityError(
				item.product,
				{},
				{ requirePublished: false },
			);
			if (sellabilityError) throw new Error(sellabilityError);
			let deliveryUrl = order.deliveryUrl;
			let deliveryUrlExpiresAt = order.deliveryUrlExpiresAt;
			const mustRefresh =
				!deliveryUrl ||
				!deliveryUrlExpiresAt ||
				deliveryUrlExpiresAt.getTime() <= Date.now() + DELIVERY_URL_MIN_REMAINING_MS;

			if (item.product.r2FileKey && mustRefresh) {
				deliveryUrl = await getSignedDownloadUrl(
					item.product.r2FileKey,
					DELIVERY_URL_LIFETIME_SECONDS,
				);
				deliveryUrlExpiresAt = new Date(Date.now() + DELIVERY_URL_LIFETIME_SECONDS * 1000);
				await db.order.update({
					where: { id: order.id },
					data: { deliveryUrl, deliveryUrlExpiresAt },
				});
			}

			const deliveryVersion = deliveryUrlExpiresAt?.getTime() ?? 0;
			await sendPurchaseConfirmation(
				email,
				item.product.slug,
				deliveryUrl ?? undefined,
				`purchase-${order.id}-${deliveryVersion}`,
			);
		} else {
			throw new Error(`Unsupported product type ${item.product.type}`);
		}

		await db.order.update({
			where: { id: order.id },
			data: {
				fulfillmentCompletedAt: new Date(),
				fulfillmentWorkingAt: null,
				fulfillmentError: null,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown fulfillment error";
		await db.order.update({
			where: { id: order.id },
			data: { fulfillmentWorkingAt: null, fulfillmentError: message.slice(0, 1000) },
		});
		throw error;
	}
}
