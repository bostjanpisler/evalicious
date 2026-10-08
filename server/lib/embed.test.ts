import { describe, expect, test } from "bun:test";
import { EMBED_DOC_ID, EMBED_KEY, embedCsp, renderEmbedDocument } from "./embed";

describe("renderEmbedDocument", () => {
	test("wraps the editor's code unchanged and reports its height for the given key", () => {
		const html = renderEmbedDocument(
			'<iframe src="https://www.google.com/maps/embed?pb=1"></iframe>',
			"abc123",
		);
		expect(html).toContain('<iframe src="https://www.google.com/maps/embed?pb=1"></iframe>');
		expect(html).toContain('"abc123"');
		expect(html).toContain("eva-embed-height");
	});
});

describe("embed isolation", () => {
	test("off the embed origin the document is always forced into an opaque sandbox", () => {
		const csp = embedCsp(false, ["https://eva-licious.com"]);
		expect(csp).toContain("sandbox allow-scripts");
		expect(csp).not.toContain("allow-same-origin");
		expect(csp).toContain("frame-ancestors 'self'");
	});

	test("on the embed origin only the site may frame it", () => {
		const csp = embedCsp(true, ["https://eva-licious.com"]);
		expect(csp).not.toContain("sandbox");
		expect(csp).toContain("frame-ancestors https://eva-licious.com");
		expect(embedCsp(true, [])).toContain("frame-ancestors 'none'");
	});

	test("document ids and keys are restricted to safe characters", () => {
		expect(EMBED_DOC_ID.test("abc-123.x_y")).toBe(true);
		expect(EMBED_DOC_ID.test("a/b")).toBe(false);
		expect(EMBED_KEY.test("f3a9c1d2e4b5")).toBe(true);
		expect(EMBED_KEY.test("k'; drop")).toBe(false);
	});
});
