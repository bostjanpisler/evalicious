import { describe, expect, test } from "bun:test";
import { createAlertThrottle } from "./alert-throttle";

describe("alert throttle", () => {
	test("the same error alerts once per window, a different one right away", () => {
		const shouldAlert = createAlertThrottle({ windowMs: 1000, maxPerWindow: 10 });
		expect(shouldAlert("a", 0)).toBe(true);
		expect(shouldAlert("a", 500)).toBe(false);
		expect(shouldAlert("b", 500)).toBe(true);
		expect(shouldAlert("a", 1001)).toBe(true);
	});

	test("caps the total per window", () => {
		const shouldAlert = createAlertThrottle({ windowMs: 1000, maxPerWindow: 2 });
		expect(shouldAlert("a", 0)).toBe(true);
		expect(shouldAlert("b", 1)).toBe(true);
		expect(shouldAlert("c", 2)).toBe(false);
		expect(shouldAlert("c", 1500)).toBe(true);
	});
});
