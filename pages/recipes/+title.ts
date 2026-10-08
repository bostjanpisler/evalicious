import type { PageContext } from "vike/types";
import { localeOf } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";

export default (pageContext: PageContext): string =>
	translatorFor(localeOf(pageContext))("recipes.meta.title");
