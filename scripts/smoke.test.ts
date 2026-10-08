import { describe, expect, test } from "bun:test";
import { looksHealthy, urlsFromSitemap } from "./smoke";

describe("urlsFromSitemap", () => {
	test("keeps same-site URLs as paths and drops other hosts", () => {
		const xml = `<urlset><url><loc>https://eva-licious.com/</loc></url><url><loc>https://eva-licious.com/en/recipes/x</loc></url><url><loc>https://other.example/y</loc></url></urlset>`;
		expect(urlsFromSitemap(xml, "https://eva-licious.com")).toEqual(["/", "/en/recipes/x"]);
	});

	test("localhost sitemaps work against a local base", () => {
		expect(urlsFromSitemap("<loc>http://localhost:3100/a</loc>", "http://localhost:3100")).toEqual([
			"/a",
		]);
	});
});

describe("looksHealthy", () => {
	test("flags server errors, truncated pages and error pages", () => {
		expect(looksHealthy("/recipes", 500, "")).toBe("HTTP 500");
		expect(looksHealthy("/recipes", 200, "<html><body>cut")).toBe("truncated HTML");
		expect(looksHealthy("/recipes", 200, "<html>Internal Server Error</html>")).toBe("error page");
		expect(looksHealthy("/recipes", 200, "<html><body>ok</body></html>")).toBeNull();
		expect(looksHealthy("/health", 200, '{"status":"ok"}')).toBeNull();
		expect(looksHealthy("/health", 200, '{"status":"down"}')).toBe("health not ok");
		expect(looksHealthy("/sitemap.xml", 200, "<?xml version")).toBeNull();
	});
});
