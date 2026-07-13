import { describe, expect, test } from "bun:test";
import { checkoutConfirmationStatus } from "./checkout-status";

describe("checkoutConfirmationStatus", () => {
	test("does not confirm unpaid sessions", () => {
		expect(checkoutConfirmationStatus("unpaid", true)).toBe("invalid");
	});

	test("reports a paid session as processing until its order exists", () => {
		expect(checkoutConfirmationStatus("paid", false)).toBe("processing");
	});

	test("confirms only a paid session with a completed order", () => {
		expect(checkoutConfirmationStatus("paid", true)).toBe("confirmed");
	});
});
