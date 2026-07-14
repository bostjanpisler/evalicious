import { describe, expect, test } from "bun:test";
import { loadOwnedOrderDetail, type OrderRecord } from "./order-details";

const order: OrderRecord = {
	id: "order_123",
	status: "completed",
	totalInCents: 1290,
	currency: "EUR",
	email: "eva@example.com",
	createdAt: new Date("2026-07-14T10:00:00.000Z"),
	spaceInvoiceNumber: "2026-0042",
	items: [
		{
			id: "item_123",
			priceInCents: 1290,
			product: { sanityId: "sanity-product", slug: "poletni-recepti", type: "ebook" },
		},
	],
};

describe("loadOwnedOrderDetail", () => {
	test("scopes the lookup to the signed-in user and enriches product metadata", async () => {
		const lookups: Array<[string, string]> = [];
		const detail = await loadOwnedOrderDetail(
			{
				findOwnedOrder: async (orderId, userId) => {
					lookups.push([orderId, userId]);
					return order;
				},
				findProductMetadata: async (ids) => {
					expect(ids).toEqual(["sanity-product"]);
					return [{ _id: "sanity-product", title: "Poletni recepti" }];
				},
			},
			"order_123",
			"user_123",
		);

		expect(lookups).toEqual([["order_123", "user_123"]]);
		expect(detail).toMatchObject({
			id: "order_123",
			invoiceNumber: "2026-0042",
			items: [{ productName: "Poletni recepti", productSlug: "poletni-recepti" }],
		});
	});

	test("returns null without requesting metadata when the owned order does not exist", async () => {
		let metadataRequested = false;
		const detail = await loadOwnedOrderDetail(
			{
				findOwnedOrder: async () => null,
				findProductMetadata: async () => {
					metadataRequested = true;
					return [];
				},
			},
			"another-order",
			"user_123",
		);

		expect(detail).toBeNull();
		expect(metadataRequested).toBe(false);
	});

	test("falls back to the purchased product slug when Sanity metadata is unavailable", async () => {
		const detail = await loadOwnedOrderDetail(
			{
				findOwnedOrder: async () => order,
				findProductMetadata: async () => [],
			},
			"order_123",
			"user_123",
		);

		expect(detail?.items[0]?.productName).toBe("poletni-recepti");
	});
});
