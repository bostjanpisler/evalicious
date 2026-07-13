import { describe, expect, test } from "bun:test";
import { assertEmailSent } from "./email";

describe("assertEmailSent", () => {
	test("accepts a successful provider response", () => {
		expect(() => assertEmailSent({ error: null }, "Purchase confirmation")).not.toThrow();
	});

	test("turns a provider error into a retryable exception", () => {
		expect(() =>
			assertEmailSent({ error: { message: "Provider unavailable" } }, "Purchase confirmation"),
		).toThrow("Purchase confirmation email failed: Provider unavailable");
	});
});
