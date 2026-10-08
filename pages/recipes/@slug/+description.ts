import type { PageContext } from "vike/types";
import { localeOf } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";
import type { Data } from "./+data";

export default (pageContext: PageContext<Data>) =>
	pageContext.data.description ??
	translatorFor(localeOf(pageContext))("recipes.detail.fallbackDescription", {
		title: pageContext.data.title,
	});
