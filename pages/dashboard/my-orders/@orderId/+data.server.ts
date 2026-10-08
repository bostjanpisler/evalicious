import { render } from "vike/abort";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { PageContextServer } from "vike/types";
import { db } from "@/server/lib/db";
import { loadOwnedOrderDetail, type OrderDetail } from "@/server/lib/order-details";
import { sanityClient } from "@/server/lib/sanity";

export type Data = {
	order: OrderDetail;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const user = (pageContext as unknown as Record<string, unknown>).user as { id: string } | null;
	if (!user) throw render(403, "Unauthorized");

	const orderId = pageContext.routeParams.orderId;
	if (!orderId) throw render(404, "Order not found");
	const order = await loadOwnedOrderDetail(
		{
			findOwnedOrder: (id, userId) =>
				db.order.findFirst({
					where: { id, userId },
					include: { items: { include: { product: true } } },
				}),
			findProductMetadata: async (ids) =>
				(await sanityClient.fetch<Array<{ _id: string; title: string; courseSlug?: string }>>(
					`*[_type == "product" && _id in $ids]{
						_id,
						"title": select($locale == "en" && defined(en.title) => en.title, title),
						"courseSlug": course->slug.current
					}`,
					{ ids, locale },
				)) ?? [],
		},
		orderId,
		user.id,
	);

	// Use the same response for an unknown order and another user's order so the
	// route never discloses whether an order ID exists.
	if (!order) throw render(404, "Order not found");

	return { order };
}
