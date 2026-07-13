import { describe, expect, test } from "bun:test";
import { formatInvoiceDate } from "./order-invoicing";

describe("formatInvoiceDate", () => {
	test("uses the Ljubljana calendar date across the UTC boundary", () => {
		expect(formatInvoiceDate(new Date("2026-07-13T22:30:00Z"))).toBe("2026-07-14");
	});

	test("accepts an explicit entity timezone", () => {
		expect(formatInvoiceDate(new Date("2026-07-13T22:30:00Z"), "UTC")).toBe("2026-07-13");
	});
});
