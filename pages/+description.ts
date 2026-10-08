import type { PageContext } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { translators } from "@/lib/i18n/messages";

export default function description(pageContext: PageContext): string {
	return translators[pageContext.locale ?? DEFAULT_LOCALE]("common.siteDescription");
}
