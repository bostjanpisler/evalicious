import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_REDIRECT, getSafeRedirect } from "./safe-redirect";

describe("getSafeRedirect", () => {
	test("keeps a local checkout return path", () => {
		expect(getSafeRedirect("/shop/zbirka?from=checkout")).toBe("/shop/zbirka?from=checkout");
	});

	test("rejects external and protocol-relative URLs", () => {
		expect(getSafeRedirect("https://example.com/steal")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(getSafeRedirect("//example.com/steal")).toBe(DEFAULT_AUTH_REDIRECT);
	});
});
