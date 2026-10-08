import type { PageContext } from "vike/types";
import { translatorFor } from "@/lib/i18n/messages";

export default (pageContext: PageContext): string =>
	translatorFor(pageContext.locale)("recipes.meta.title");
