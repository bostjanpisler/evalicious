import { useMemo } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { type Translator, translatorFor } from "./messages";
import { localizePath } from "./paths";

const DATE_LOCALES: Record<Locale, string> = { sl: "sl-SI", en: "en-GB" };

export function formatLocalizedDate(date: string | Date, locale: Locale): string {
	return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
}

export type I18n = {
	locale: Locale;
	t: Translator;
	/** Prefixes an internal page path with the current locale ("/recipes" -> "/en/recipes"). */
	l: (href: string) => string;
	formatDate: (date: string | Date) => string;
};

export function createI18n(locale: Locale | undefined): I18n {
	const resolved = locale ?? DEFAULT_LOCALE;
	return {
		locale: resolved,
		t: translatorFor(resolved),
		l: (href) => localizePath(href, resolved),
		formatDate: (date) => formatLocalizedDate(date, resolved),
	};
}

export function useI18n(): I18n {
	const locale = usePageContext().locale;
	return useMemo(() => createI18n(locale), [locale]);
}
