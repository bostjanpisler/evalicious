import { describe, expect, test } from "bun:test";
import { alternatePaths } from "./alternates";

describe("alternatePaths", () => {
	test("uses the same path for pages that are not translated documents", () => {
		expect(alternatePaths("/about")).toEqual({ sl: "/about", en: "/en/about" });
		expect(alternatePaths("/", null)).toEqual({ sl: "/", en: "/en" });
	});

	test("links translated documents to their counterpart slug", () => {
		const data = {
			_type: "recipe",
			translations: [
				{ language: "sl", slug: "zajtrk" },
				{ language: "en", slug: "breakfast" },
			],
		};
		expect(alternatePaths("/recipes/zajtrk", data)).toEqual({
			sl: "/recipes/zajtrk",
			en: "/en/recipes/breakfast",
		});
	});

	test("falls back to the section page when there is no translation", () => {
		const data = { _type: "travelEntry", translations: [{ slug: "nara" }] };
		expect(alternatePaths("/travel/nara", data)).toEqual({ sl: "/travel/nara", en: "/en/travel" });
	});
});
