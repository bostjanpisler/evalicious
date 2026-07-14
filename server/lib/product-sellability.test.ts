import { describe, expect, test } from "bun:test";
import { deliveryConfigurationError, productSellabilityError } from "./product-sellability";

const paidProduct = {
	published: true,
	type: "ebook",
	priceInCents: 1900,
	stripePriceId: "price_1",
	stripeProductId: "prod_1",
	r2FileKey: "ebooks/book.pdf",
};

describe("product sellability", () => {
	test("accepts a deliverable paid ebook", () => {
		expect(productSellabilityError(paidProduct)).toBeNull();
	});

	test("rejects an ebook without a private delivery file", () => {
		expect(productSellabilityError({ ...paidProduct, r2FileKey: null })).toContain("delivery file");
	});

	test("rejects unsupported offline products", () => {
		expect(productSellabilityError({ ...paidProduct, type: "workshop" })).toContain("Unsupported");
	});

	test("requires a linked course for course products", () => {
		expect(productSellabilityError({ ...paidProduct, type: "ecourse", r2FileKey: null })).toContain(
			"linked course",
		);
		expect(
			productSellabilityError(
				{ ...paidProduct, type: "ecourse", r2FileKey: null },
				{ courseId: "course_1" },
			),
		).toBeNull();
	});

	test("allows an already-paid product to be delivered after it is unpublished", () => {
		expect(
			productSellabilityError(
				{ ...paidProduct, published: false },
				{},
				{ requirePublished: false },
			),
		).toBeNull();
	});

	test("fails checkout configuration closed when delivery providers are missing", () => {
		expect(deliveryConfigurationError("ecourse", {})).toContain("email");
		expect(deliveryConfigurationError("ebook", { RESEND_API_KEY: "re_test" })).toContain("storage");
		expect(
			deliveryConfigurationError("ebook", {
				RESEND_API_KEY: "re_test",
				R2_ACCOUNT_ID: "account",
				R2_ACCESS_KEY_ID: "access",
				R2_SECRET_ACCESS_KEY: "secret",
				R2_BUCKET_NAME: "bucket",
			}),
		).toBeNull();
	});
});
