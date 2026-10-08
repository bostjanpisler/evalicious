import { describe, expect, test } from "bun:test";
import { buildEntries, buildSitemapXml, type SitemapDoc } from "./sitemap";

const docs: SitemapDoc[] = [
	{
		_type: "recipe",
		slug: "zajtrk",
		language: "sl",
		root: "r1",
		updatedAt: "2026-10-01T10:00:00Z",
	},
	{ _type: "recipe", slug: "breakfast", language: "en", root: "r1" },
	{ _type: "recipe", slug: "samo-slovensko", language: "sl", root: "r2" },
	{ _type: "product", slug: "ebook", root: "p1" },
];

describe("sitemap", () => {
	test("while English is off only Slovenian URLs are listed, without alternates", () => {
		const xml = buildSitemapXml(buildEntries(docs, false), "https://eva-licious.com");
		expect(xml).toContain("<loc>https://eva-licious.com/recipes/zajtrk</loc>");
		expect(xml).toContain("<lastmod>2026-10-01</lastmod>");
		expect(xml).not.toContain("/en");
		expect(xml).not.toContain("xhtml:link rel");
	});

	test("with English on, translations are linked to each other", () => {
		const xml = buildSitemapXml(buildEntries(docs, true), "https://eva-licious.com");
		expect(xml).toContain("<loc>https://eva-licious.com/en/recipes/breakfast</loc>");
		expect(xml).toContain('hreflang="en" href="https://eva-licious.com/en/recipes/breakfast"');
		expect(xml).toContain('hreflang="sl" href="https://eva-licious.com/recipes/zajtrk"');
		// a recipe with no translation has no English URL and no alternates
		expect(xml).not.toContain("samo-slovensko</loc><xhtml");
		expect(xml).not.toContain("/en/recipes/samo-slovensko");
		// products appear in both languages under the same slug
		expect(xml).toContain("<loc>https://eva-licious.com/en/shop/ebook</loc>");
	});

	test("escapes XML special characters", () => {
		const xml = buildSitemapXml(
			buildEntries([{ _type: "blogPost", slug: "a&b", language: "sl", root: "b1" }], false),
			"https://x.test",
		);
		expect(xml).toContain("/blog/a&amp;b");
	});
});
