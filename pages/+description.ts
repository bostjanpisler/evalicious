import type { PageContext } from "vike/types";
import { localeOf } from "@/lib/i18n/config";
import { translators } from "@/lib/i18n/messages";

export default function description(pageContext: PageContext): string {
	return translators[localeOf(pageContext)]("common.siteDescription");
}
