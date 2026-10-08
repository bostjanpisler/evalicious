import {
	DEFAULT_LOCALE,
	ENGLISH_ENABLED,
	HTML_LANG,
	LOCALES,
	type Locale,
} from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/paths";

export type SitemapDoc = {
	_type: string;
	slug: string;
	language?: string | null;
	/** Id of the Slovenian original this document belongs to (itself for originals). */
	root: string;
	updatedAt?: string | null;
};

const STATIC_PATHS = ["/", "/recipes", "/courses", "/blog", "/shop", "/travel", "/about"];

// Where each content type's pages live.
const SECTION: Record<string, string> = {
	recipe: "/recipes",
	travelEntry: "/travel",
	blogPost: "/blog",
	product: "/shop",
	course: "/courses",
};

// Translated as one document per language; products and courses are one document
// shown in both languages under the same slug.
const PER_LANGUAGE = new Set(["recipe", "travelEntry", "blogPost"]);

type Entry = {
	path: string;
	locale: Locale;
	updatedAt?: string | null;
	alternates: { locale: Locale; path: string }[];
};

function xmlEscape(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function buildEntries(docs: SitemapDoc[], englishEnabled = ENGLISH_ENABLED): Entry[] {
	const locales: Locale[] = englishEnabled ? [...LOCALES] : [DEFAULT_LOCALE];
	const entries: Entry[] = [];

	for (const path of STATIC_PATHS) {
		const alternates = locales.map((locale) => ({ locale, path: localizePath(path, locale) }));
		for (const alt of alternates) entries.push({ path: alt.path, locale: alt.locale, alternates });
	}

	const groups = new Map<string, SitemapDoc[]>();
	for (const doc of docs) {
		const section = SECTION[doc._type];
		if (!section || !doc.slug) continue;
		const key = `${doc._type}:${PER_LANGUAGE.has(doc._type) ? doc.root : doc.slug}`;
		groups.set(key, [...(groups.get(key) ?? []), doc]);
	}

	for (const group of groups.values()) {
		const type = group[0]?._type ?? "";
		const section = SECTION[type] ?? "/";
		if (!PER_LANGUAGE.has(type)) {
			const doc = group[0];
			if (!doc) continue;
			const alternates = locales.map((locale) => ({
				locale,
				path: localizePath(`${section}/${doc.slug}`, locale),
			}));
			for (const alt of alternates)
				entries.push({ path: alt.path, locale: alt.locale, updatedAt: doc.updatedAt, alternates });
			continue;
		}
		const byLocale = new Map<Locale, SitemapDoc>();
		for (const doc of group) {
			const locale = (doc.language ?? DEFAULT_LOCALE) as Locale;
			if (locales.includes(locale)) byLocale.set(locale, doc);
		}
		const alternates = [...byLocale].map(([locale, doc]) => ({
			locale,
			path: localizePath(`${section}/${doc.slug}`, locale),
		}));
		for (const [locale, doc] of byLocale) {
			entries.push({
				path: localizePath(`${section}/${doc.slug}`, locale),
				locale,
				updatedAt: doc.updatedAt,
				alternates,
			});
		}
	}
	return entries;
}

export function buildSitemapXml(entries: Entry[], origin: string): string {
	const urls = entries.map((entry) => {
		const links =
			entry.alternates.length > 1
				? entry.alternates
						.map(
							(alt) =>
								`<xhtml:link rel="alternate" hreflang="${HTML_LANG[alt.locale]}" href="${xmlEscape(origin + alt.path)}"/>`,
						)
						.join("")
				: "";
		const lastmod = entry.updatedAt
			? `<lastmod>${xmlEscape(entry.updatedAt.slice(0, 10))}</lastmod>`
			: "";
		return `<url><loc>${xmlEscape(origin + entry.path)}</loc>${lastmod}${links}</url>`;
	});
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}
