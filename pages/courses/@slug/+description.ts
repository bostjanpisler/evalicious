import type { PageContext } from "vike/types";
import { translatorFor } from "@/lib/i18n/messages";
import type { Data } from "./+data";

export default (pageContext: PageContext<Data>) =>
	pageContext.data.description ??
	translatorFor(pageContext.locale)("courses.meta.detailDescription", {
		title: pageContext.data.title,
	});
