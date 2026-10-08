import { modifyUrl } from "vike/modifyUrl";
import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE, ENGLISH_ENABLED } from "@/lib/i18n/config";
import { extractLocale } from "@/lib/i18n/paths";

// Runs on the server and the client: /en/recipes renders the /recipes page with
// `pageContext.locale = "en"`. While English is disabled the prefix is left in
// place, so /en/* matches no page and is a 404.
export function onBeforeRoute(pageContext: PageContextServer) {
	const { locale, path } = extractLocale(pageContext.urlParsed.pathname);
	if (locale !== DEFAULT_LOCALE && !ENGLISH_ENABLED) {
		return { pageContext: { locale: DEFAULT_LOCALE } };
	}
	return {
		pageContext: {
			locale,
			urlLogical: modifyUrl(pageContext.urlParsed.href, { pathname: path }),
		},
	};
}
