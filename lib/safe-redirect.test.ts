import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_REDIRECT, getSafeRedirect } from "./safe-redirect";

describe("getSafeRedirect", () => {
	test("keeps a local checkout return path", () => {
		expect(getSafeRedirect("/shop/zbirka?from=checkout")).toBe("/shop/zbirka?from=checkout");
	});

	test("keeps a locale-prefixed path", () => {
		expect(getSafeRedirect("/en/dashboard/my-recipes")).toBe("/en/dashboard/my-recipes");
		expect(getSafeRedirect("/en/shop/zbirka?from=checkout#top")).toBe(
			"/en/shop/zbirka?from=checkout#top",
		);
	});

	test("falls back to the given localized default", () => {
		expect(getSafeRedirect(null, "/en/dashboard/my-recipes")).toBe("/en/dashboard/my-recipes");
		expect(getSafeRedirect("//example.com/steal", "/en/dashboard/my-recipes")).toBe(
			"/en/dashboard/my-recipes",
		);
		expect(getSafeRedirect("https://example.com/steal", "/en/dashboard/my-recipes")).toBe(
			"/en/dashboard/my-recipes",
		);
	});

	test("rejects external and protocol-relative URLs", () => {
		expect(getSafeRedirect("https://example.com/steal")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(getSafeRedirect("//example.com/steal")).toBe(DEFAULT_AUTH_REDIRECT);
	});
});
