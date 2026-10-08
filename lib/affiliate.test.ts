import { describe, expect, test } from "bun:test";
import {
	affiliateProgramFor,
	contentHasAffiliate,
	affiliateUrl,
	bookingSearchUrl,
	isAffiliateRuleActive,
	linkAttributes,
} from "./affiliate";

const hosts = { booking: ["booking.com"], amazon: ["amazon.de"] };
const networks = ["anrdoezrs.net", "amzn.to"];

describe("affiliateProgramFor", () => {
	test("matches the domain and its subdomains, nothing lookalike", () => {
		expect(affiliateProgramFor("https://www.booking.com/hotel/x", hosts)).toBe("booking");
		expect(affiliateProgramFor("https://booking.com/", hosts)).toBe("booking");
		expect(affiliateProgramFor("https://notbooking.com/", hosts)).toBeNull();
		expect(affiliateProgramFor("https://booking.com.evil.example/", hosts)).toBeNull();
		expect(affiliateProgramFor("mailto:a@booking.com", hosts)).toBeNull();
	});
});

describe("affiliateUrl", () => {
	const url = "https://www.booking.com/searchresults.html?ss=Nara";

	test("stays off until the program is configured", () => {
		expect(isAffiliateRuleActive({})).toBe(false);
		expect(affiliateUrl(url, "nara", { booking: {} }, hosts)).toBeNull();
		expect(affiliateUrl(url, "nara", { booking: { template: "  " } }, hosts)).toBeNull();
	});

	test("wraps the destination in the network deep link with the sub-ID", () => {
		const template = "https://www.anrdoezrs.net/links/123/type/dlg/sid/{label}/{url}";
		const result = affiliateUrl(url, "nara dan", { booking: { template } }, hosts);
		expect(result).toBe(
			`https://www.anrdoezrs.net/links/123/type/dlg/sid/nara%20dan/${encodeURIComponent(url)}`,
		);
	});

	test("appends query parameters for tag-style programs", () => {
		const result = affiliateUrl(
			"https://www.amazon.de/dp/B000?psc=1",
			"x",
			{ amazon: { params: { tag: "eva-21" } } },
			hosts,
		);
		expect(result).toBe("https://www.amazon.de/dp/B000?psc=1&tag=eva-21");
	});
});

describe("linkAttributes", () => {
	const rules = {
		booking: { template: "https://www.anrdoezrs.net/click-1?url={url}&sid={label}" },
	};

	test("rewrites a configured destination and marks it sponsored", () => {
		const link = linkAttributes("https://www.booking.com/city/jp/nara.html", "nara", {
			rules,
			programHosts: hosts,
			networkHosts: networks,
		});
		expect(link.href.startsWith("https://www.anrdoezrs.net/click-1")).toBe(true);
		expect(link.rel).toBe("sponsored noopener noreferrer");
		expect(link.sponsored).toBe(true);
	});

	test("marks a pre-tracked network link sponsored without touching it", () => {
		const href = "https://amzn.to/abc";
		const link = linkAttributes(href, "x", {
			rules: {},
			programHosts: hosts,
			networkHosts: networks,
		});
		expect(link.href).toBe(href);
		expect(link.sponsored).toBe(true);
	});

	test("leaves ordinary links alone, and unconfigured programs untracked", () => {
		const plain = linkAttributes("https://example.com/", "x", { rules: {}, programHosts: hosts });
		expect(plain).toMatchObject({ href: "https://example.com/", sponsored: false });
		const booking = linkAttributes("https://www.booking.com/x", "x", {
			rules: {},
			programHosts: hosts,
		});
		expect(booking).toMatchObject({ href: "https://www.booking.com/x", sponsored: false });
	});

	test("does not rewrite relative or non-http links", () => {
		expect(linkAttributes("/travel/nara", "x").sponsored).toBe(false);
		expect(linkAttributes(undefined, "x").href).toBe("");
	});
});

describe("bookingSearchUrl", () => {
	test("encodes the destination and asks for the Slovenian site", () => {
		const url = new URL(bookingSearchUrl("Nara, Japonska"));
		expect(url.hostname).toBe("www.booking.com");
		expect(url.searchParams.get("ss")).toBe("Nara, Japonska");
		expect(url.searchParams.get("lang")).toBe("sl");
	});
});

describe("contentHasAffiliate", () => {
	test("detects network embeds and tracked links, ignores everything else", () => {
		const klook = {
			_type: "htmlEmbed",
			code: '<ins class="klk-aff-widget"><a href="//www.klook.com/">k</a></ins>',
		};
		const maps = {
			_type: "htmlEmbed",
			code: '<iframe src="https://www.google.com/maps/embed"></iframe>',
		};
		const link = (href: string) => ({ _type: "block", markDefs: [{ _type: "link", href }] });
		expect(
			contentHasAffiliate([maps, link("https://example.com")], ["klook.com", "amzn.to"], hosts, {}),
		).toBe(false);
		expect(contentHasAffiliate([maps, klook], ["klook.com"], hosts, {})).toBe(true);
		expect(contentHasAffiliate([link("https://amzn.to/x")], ["amzn.to"], hosts, {})).toBe(true);
		expect(contentHasAffiliate(undefined)).toBe(false);
	});

	test("counts plain Booking.com links only once Booking tracking is on", () => {
		const block = {
			_type: "block",
			markDefs: [{ _type: "link", href: "https://www.booking.com/x" }],
		};
		expect(contentHasAffiliate([block], [], hosts, { booking: {} })).toBe(false);
		expect(
			contentHasAffiliate([block], [], hosts, { booking: { template: "https://t/{url}" } }),
		).toBe(true);
	});
});
