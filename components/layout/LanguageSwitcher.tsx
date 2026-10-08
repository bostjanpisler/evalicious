"use client";

import { usePageContext } from "vike-react/usePageContext";
import { useData } from "vike-react/useData";
import { Button } from "@/components/ui/button";
import { alternatePaths } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, ENGLISH_ENABLED, LOCALE_SHORT, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/react";

/** Switches between Slovenian and English, landing on the counterpart of the current page. */
export function LanguageSwitcher() {
	const { locale, t } = useI18n();
	const pageContext = usePageContext();
	const data = useData<
		{ _type?: string; translations?: { language?: string; slug?: string }[] } | undefined
	>();
	if (!ENGLISH_ENABLED) return null;

	const target: Locale = locale === DEFAULT_LOCALE ? "en" : DEFAULT_LOCALE;
	const href = alternatePaths(pageContext.urlPathname, data)[target];

	return (
		<Button variant="ghost" size="sm" asChild>
			<a href={href} hrefLang={target} lang={target} aria-label={t("common.language.switchTo")}>
				{LOCALE_SHORT[target]}
			</a>
		</Button>
	);
}
