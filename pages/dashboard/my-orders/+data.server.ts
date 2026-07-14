import type { PageContextServer } from "vike/types";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";

export interface OrderItem {
	id: string;
	priceInCents: number;
	productSlug: string;
	productType: string;
	productName: string;
	courseSlug?: string;
}

export interface OrderWithItems {
	id: string;
	status: string;
	totalInCents: number;
	currency: string;
	createdAt: string;
	items: OrderItem[];
}

export type Data = {
	orders: OrderWithItems[];
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = pageContext.user;
	if (!user) return { orders: [] };

	const orders = await db.order.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
		include: {
			items: {
				include: {
					product: true,
				},
			},
		},
	});

	if (orders.length === 0) return { orders: [] };

	// Collect unique sanity IDs to fetch product names
	const sanityIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.product.sanityId)))];

	const sanityProducts = await sanityClient.fetch<
		Array<{ _id: string; title: string; courseSlug?: string }>
	>(
		`*[_type == "product" && _id in $ids]{
			_id,
			title,
			"courseSlug": course->slug.current
		}`,
		{ ids: sanityIds },
	);

	const nameMap = new Map(
		(sanityProducts ?? []).map((p) => [p._id, { title: p.title, courseSlug: p.courseSlug }]),
	);

	return {
		orders: orders.map((o) => ({
			id: o.id,
			status: o.status,
			totalInCents: o.totalInCents,
			currency: o.currency,
			createdAt: o.createdAt.toISOString(),
			items: o.items.map((item) => {
				const sanity = nameMap.get(item.product.sanityId);
				return {
					id: item.id,
					priceInCents: item.priceInCents,
					productSlug: item.product.slug,
					productType: item.product.type,
					productName: sanity?.title ?? item.product.slug,
					courseSlug: sanity?.courseSlug,
				};
			}),
		})),
	};
}
