import { DEFAULT_LOCALE, type Locale, LOCALES } from "./config";

const NON_DEFAULT = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** Splits `/en/recipes/x` into `{ locale: "en", path: "/recipes/x" }`. */
export function extractLocale(pathname: string): { locale: Locale; path: string } {
	for (const locale of NON_DEFAULT) {
		if (pathname === `/${locale}`) return { locale, path: "/" };
		if (pathname.startsWith(`/${locale}/`)) {
			return { locale, path: pathname.slice(locale.length + 1) };
		}
	}
	return { locale: DEFAULT_LOCALE, path: pathname };
}

function isInternalPagePath(href: string): boolean {
	if (!href.startsWith("/") || href.startsWith("//")) return false;
	// API routes, static assets and the CMS studio are not localized.
	return !/^\/(api|embed|studio|images|favicon|theme\.js|robots\.txt|sitemap)/.test(href);
}

/** Prefixes an internal page path with the locale; leaves everything else alone. */
export function localizePath(href: string, locale: Locale): string {
	if (locale === DEFAULT_LOCALE || !isInternalPagePath(href)) return href;
	const { locale: existing } = extractLocale(href.split(/[?#]/)[0] ?? href);
	if (existing !== DEFAULT_LOCALE) return href;
	if (href === "/") return `/${locale}`;
	if (href.startsWith("/?") || href.startsWith("/#")) return `/${locale}${href.slice(1)}`;
	return `/${locale}${href}`;
}

/** The same page in another locale (for hreflang and the language switcher). */
export function switchLocalePath(currentPath: string, to: Locale): string {
	const { path } = extractLocale(currentPath);
	return localizePath(path, to);
}
