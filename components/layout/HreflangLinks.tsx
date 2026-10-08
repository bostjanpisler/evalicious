import { Head } from "vike-react/Head";
import { useData } from "vike-react/useData";
import { usePageContext } from "vike-react/usePageContext";
import { SITE_URL } from "@/lib/constants";
import { alternatePaths, hreflangLocales } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, ENGLISH_ENABLED, HTML_LANG } from "@/lib/i18n/config";

/** hreflang alternates and a canonical link, so search engines pair the two languages. */
export function HreflangLinks() {
	const pageContext = usePageContext();
	const data = useData<
		{ _type?: string; translations?: { language?: string; slug?: string }[] } | undefined
	>();
	if (!ENGLISH_ENABLED) return null;
	if (pageContext.urlPathname.startsWith("/dashboard") || pageContext.is404) return null;

	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const paths = alternatePaths(pageContext.urlPathname, data);
	const locales = hreflangLocales(data, locale);

	return (
		<Head>
			<link rel="canonical" href={`${SITE_URL}${paths[locale]}`} />
			{locales.map((entry) => (
				<link
					key={entry}
					rel="alternate"
					hrefLang={HTML_LANG[entry]}
					href={`${SITE_URL}${paths[entry]}`}
				/>
			))}
			{locales.includes(DEFAULT_LOCALE) && (
				<link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${paths[DEFAULT_LOCALE]}`} />
			)}
		</Head>
	);
}
