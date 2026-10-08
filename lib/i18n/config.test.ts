import { describe, expect, test } from "bun:test";
import { ENGLISH_ENABLED, localeOf } from "./config";

describe("localeOf", () => {
	test("uses the locale Vike resolved when there is one", () => {
		expect(localeOf({ locale: "sl", urlOriginal: "/en/x" })).toBe("sl");
		expect(localeOf({ locale: "en" })).toBe("en");
	});

	test("recovers the locale for error pages from the original URL", () => {
		const expected = ENGLISH_ENABLED ? "en" : "sl";
		expect(localeOf({ urlOriginal: "http://localhost:3100/en/recipes/x?y=1" })).toBe(expected);
		expect(localeOf({ urlOriginal: "/en" })).toBe(expected);
		expect(localeOf({ urlOriginal: "/english-breakfast" })).toBe("sl");
		expect(localeOf({ urlOriginal: "/recipes/x" })).toBe("sl");
		expect(localeOf({})).toBe("sl");
	});
});
