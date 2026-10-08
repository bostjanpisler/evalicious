import { describe, expect, test } from "bun:test";
import { createTranslator } from "./translate";
import { extractLocale, localizePath, switchLocalePath } from "./paths";

describe("paths", () => {
	test("extracts the locale prefix", () => {
		expect(extractLocale("/en/recipes/x")).toEqual({ locale: "en", path: "/recipes/x" });
		expect(extractLocale("/en")).toEqual({ locale: "en", path: "/" });
		expect(extractLocale("/recipes")).toEqual({ locale: "sl", path: "/recipes" });
		expect(extractLocale("/english-breakfast")).toEqual({
			locale: "sl",
			path: "/english-breakfast",
		});
	});

	test("localizes page paths only", () => {
		expect(localizePath("/recipes", "en")).toBe("/en/recipes");
		expect(localizePath("/", "en")).toBe("/en");
		expect(localizePath("/?q=1", "en")).toBe("/en?q=1");
		expect(localizePath("/recipes#top", "en")).toBe("/en/recipes#top");
		expect(localizePath("/recipes", "sl")).toBe("/recipes");
		expect(localizePath("/en/recipes", "en")).toBe("/en/recipes");
		expect(localizePath("/api/download/f?token=x", "en")).toBe("/api/download/f?token=x");
		expect(localizePath("/studio/desk", "en")).toBe("/studio/desk");
		expect(localizePath("https://example.com/x", "en")).toBe("https://example.com/x");
		expect(localizePath("//cdn.example.com/x", "en")).toBe("//cdn.example.com/x");
		expect(localizePath("mailto:a@b.c", "en")).toBe("mailto:a@b.c");
	});

	test("switches the locale of the current page", () => {
		expect(switchLocalePath("/en/recipes/x", "sl")).toBe("/recipes/x");
		expect(switchLocalePath("/recipes/x", "en")).toBe("/en/recipes/x");
		expect(switchLocalePath("/en", "sl")).toBe("/");
	});
});

describe("createTranslator", () => {
	const sl = {
		a: { b: "Pozdrav {name}" },
		only: "samo slovensko",
		count: (n: number) => (n === 1 ? "1 korak" : `${n} korakov`),
	};
	const en = {
		a: { b: "Hello {name}" },
		count: (n: number) => (n === 1 ? "1 step" : `${n} steps`),
	};
	const t = createTranslator<typeof sl>(en, sl, "en");

	test("interpolates, pluralises and falls back", () => {
		expect(t("a.b", { name: "Eva" })).toBe("Hello Eva");
		expect(t("count", { n: 1 })).toBe("1 step");
		expect(t("count", { n: 5 })).toBe("5 steps");
		expect(t("only")).toBe("samo slovensko");
		expect(t("missing.key")).toBe("missing.key");
	});
});
