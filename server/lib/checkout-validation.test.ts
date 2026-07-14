import { describe, expect, test } from "bun:test";
import { checkoutProductSlug, paymentMatchesProduct } from "./checkout-validation";

describe("checkout validation", () => {
	test("accepts only a bounded product slug", () => {
		expect(checkoutProductSlug({ productSlug: "poletni-recepti" })).toBe("poletni-recepti");
		expect(checkoutProductSlug({ productSlug: "../../admin" })).toBeNull();
		expect(checkoutProductSlug({ productSlug: 42 })).toBeNull();
		expect(checkoutProductSlug(null)).toBeNull();
	});

	test("requires the paid amount and currency to match the product", () => {
		const product = { priceInCents: 1290, currency: "EUR" };
		expect(paymentMatchesProduct({ amountTotal: 1290, currency: "eur" }, product)).toBe(true);
		expect(paymentMatchesProduct({ amountTotal: 990, currency: "eur" }, product)).toBe(false);
		expect(paymentMatchesProduct({ amountTotal: 1290, currency: "usd" }, product)).toBe(false);
		expect(paymentMatchesProduct({ amountTotal: null, currency: null }, product)).toBe(false);
	});
});
