import type { PageContext } from "vike/types";
import { HTML_LANG, localeOf } from "@/lib/i18n/config";

export default function lang(pageContext: PageContext): string {
	return HTML_LANG[localeOf(pageContext)];
}
