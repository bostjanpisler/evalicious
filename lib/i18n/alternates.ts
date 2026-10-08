import { ENGLISH_ENABLED, LOCALES, type Locale } from "./config";
import { extractLocale, localizePath } from "./paths";

// Content types that exist as one Sanity document per language, and where their pages live.
const TRANSLATED_DOCUMENT_BASE: Record<string, string> = {
	recipe: "/recipes",
	travelEntry: "/travel",
	blogPost: "/blog",
};

type TranslatableData = {
	_type?: string;
	translations?: { language?: string; slug?: string }[];
} | null;

/**
 * Where the current page lives in each locale. Documents translated as separate
 * Sanity documents link to the counterpart's own slug (or to the section page when
 * there is no translation yet); every other page uses the same path in each locale.
 */
export function alternatePaths(rawPath: string, data?: TranslatableData): Record<Locale, string> {
	const { path } = extractLocale(rawPath);
	const base = data?._type ? TRANSLATED_DOCUMENT_BASE[data._type] : undefined;
	const result = {} as Record<Locale, string>;
	for (const locale of LOCALES) {
		if (base) {
			const match = data?.translations?.find((entry) => (entry.language ?? "sl") === locale);
			result[locale] = localizePath(match?.slug ? `${base}/${match.slug}` : base, locale);
		} else {
			result[locale] = localizePath(path, locale);
		}
	}
	return result;
}

/** Locales a page really exists in, for hreflang tags. */
export function hreflangLocales(
	data: TranslatableData | undefined,
	currentLocale: Locale,
): Locale[] {
	if (!ENGLISH_ENABLED) return [currentLocale];
	const base = data?._type ? TRANSLATED_DOCUMENT_BASE[data._type] : undefined;
	if (!base) return [...LOCALES];
	return LOCALES.filter(
		(locale) =>
			locale === currentLocale ||
			data?.translations?.some((entry) => (entry.language ?? "sl") === locale),
	);
}
