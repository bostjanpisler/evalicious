import type { PageContext } from "vike/types";
import { translatorFor } from "@/lib/i18n/messages";

export default function title(pageContext: PageContext): string {
	return translatorFor(pageContext.locale)("dashboard.settings.title");
}
