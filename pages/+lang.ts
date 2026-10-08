import type { PageContext } from "vike/types";
import { DEFAULT_LOCALE, HTML_LANG } from "@/lib/i18n/config";

export default function lang(pageContext: PageContext): string {
	return HTML_LANG[pageContext.locale ?? DEFAULT_LOCALE];
}
