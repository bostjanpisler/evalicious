import { Hono } from "hono";
import { buildEntries, buildSitemapXml, type SitemapDoc } from "../lib/sitemap.js";
import { sanityClient } from "../lib/sanity.js";

export const sitemapHandler = new Hono();

const CACHE_MS = 60 * 60_000;
let cache: { xml: string; expires: number } | null = null;

sitemapHandler.get("/sitemap.xml", async (c) => {
	if (!cache || cache.expires < Date.now()) {
		const docs =
			(await sanityClient.fetch<SitemapDoc[]>(
				`*[_type in ["recipe", "travelEntry", "blogPost", "product", "course"] && published == true && !(_id in path("drafts.**")) && defined(slug.current)] {
					_type,
					"slug": slug.current,
					"language": coalesce(language, "sl"),
					"root": coalesce(translationOf._ref, _id),
					"updatedAt": _updatedAt
				}`,
			)) ?? [];
		const origin = (process.env.BETTER_AUTH_URL ?? "https://eva-licious.com").replace(/\/$/, "");
		cache = { xml: buildSitemapXml(buildEntries(docs), origin), expires: Date.now() + CACHE_MS };
	}
	return c.body(cache.xml, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
	});
});
