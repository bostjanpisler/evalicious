import type { PageContext } from "vike/types";
import { localeOf } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";

export default function title(pageContext: PageContext): string {
	return translatorFor(localeOf(pageContext))("auth.reset.title");
}
