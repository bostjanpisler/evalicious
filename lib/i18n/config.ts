export const LOCALES = ["sl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "sl";

/**
 * The English site lives under /en. While this is false /en/* is a 404 and the
 * language switcher is hidden, so English can be built and merged safely.
 */
export const ENGLISH_ENABLED = true;

export const LOCALE_LABELS: Record<Locale, string> = { sl: "Slovenščina", en: "English" };
export const LOCALE_SHORT: Record<Locale, string> = { sl: "SL", en: "EN" };
export const HTML_LANG: Record<Locale, string> = { sl: "sl", en: "en" };
export const OG_LOCALE: Record<Locale, string> = { sl: "sl_SI", en: "en_GB" };

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function enabledLocales(): Locale[] {
	return ENGLISH_ENABLED ? [...LOCALES] : [DEFAULT_LOCALE];
}

/**
 * The locale of a page context. Vike runs `onBeforeRoute` only for the page being
 * routed, so an error page (a thrown 404/403) has no `locale`; recover it from the
 * original URL so errors render in the visitor's language.
 */
export function localeOf(pageContext: { locale?: Locale; urlOriginal?: string }): Locale {
	if (pageContext.locale) return pageContext.locale;
	if (!ENGLISH_ENABLED || !pageContext.urlOriginal) return DEFAULT_LOCALE;
	// urlOriginal may be a full URL (server) or a path.
	const path = new URL(pageContext.urlOriginal, "http://localhost").pathname;
	return path === "/en" || path.startsWith("/en/") ? "en" : DEFAULT_LOCALE;
}
