import { Hono } from "hono";
import { isEmbedHost } from "@/lib/constants";
import { EMBED_DOC_ID, EMBED_KEY, embedCsp, renderEmbedDocument } from "../lib/embed.js";
import { allowedOrigins } from "../lib/origins.js";
import { sanityClient } from "../lib/sanity.js";

export const embedHandler = new Hono();

embedHandler.get("/:docId/:key", async (c) => {
	const { docId, key } = c.req.param();
	if (!EMBED_DOC_ID.test(docId) || !EMBED_KEY.test(key)) return c.text("Not found", 404);

	// Published content only: the read token can also see drafts.
	const embed = await sanityClient.fetch<{ code?: string } | null>(
		`*[_id == $docId && !(_id in path("drafts.**")) && published == true][0].content[_type == "htmlEmbed" && _key == $key][0]{ code }`,
		{ docId, key },
	);
	if (!embed?.code) return c.text("Not found", 404);

	return c.body(renderEmbedDocument(embed.code, key), 200, {
		"Content-Type": "text/html; charset=utf-8",
		"Content-Security-Policy": embedCsp(
			isEmbedHost(c.req.header("x-forwarded-host") ?? c.req.header("host")),
			allowedOrigins,
		),
		"X-Content-Type-Options": "nosniff",
		"Cache-Control": "public, max-age=300",
	});
});
