import { describe, expect, test } from "bun:test";
import { parseConsent } from "./consent";

describe("parseConsent", () => {
	test("maps stored values to a tri-state", () => {
		expect(parseConsent("granted")).toBe(true);
		expect(parseConsent("denied")).toBe(false);
		expect(parseConsent(null)).toBeNull();
		expect(parseConsent("whatever")).toBeNull();
	});
});
