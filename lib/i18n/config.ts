export const LOCALES = ["sl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "sl";

/**
 * The English site lives under /en. While this is false /en/* is a 404 and the
 * language switcher is hidden, so English can be built and merged safely.
 */
export const ENGLISH_ENABLED = false;

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
