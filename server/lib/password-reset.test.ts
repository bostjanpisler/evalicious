import { describe, expect, test } from "bun:test";
import { resetLocale, resetUrl } from "./password-reset";

describe("resetLocale", () => {
	test("reads the language from the callback path", () => {
		const base = "https://eva-licious.com/api/auth/reset-password/tok";
		expect(resetLocale(`${base}?callbackURL=${encodeURIComponent("/en/reset-password")}`)).toBe(
			"en",
		);
		expect(resetLocale(`${base}?callbackURL=${encodeURIComponent("/reset-password")}`)).toBe("sl");
		expect(resetLocale(`${base}?callbackURL=`)).toBe("sl");
		expect(resetLocale(base)).toBe("sl");
	});
});

describe("resetUrl", () => {
	test("puts the token in the fragment on the localized page", () => {
		expect(resetUrl("a b", "sl")).toMatch(/\/reset-password#token=a%20b$/);
		expect(resetUrl("tok", "en")).toMatch(/\/en\/reset-password#token=tok$/);
	});
});
