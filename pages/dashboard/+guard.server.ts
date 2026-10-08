import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { redirect } from "vike/abort";
import type { GuardAsync } from "vike/types";
import { localizePath } from "@/lib/i18n/paths";
import { auth } from "@/server/lib/auth";

export const guard: GuardAsync = async (pageContext) => {
	const loginUrl = localizePath("/login", pageContext.locale ?? DEFAULT_LOCALE);
	const headers = pageContext.headers ? new Headers(pageContext.headers) : null;
	if (!headers) throw redirect(loginUrl);

	try {
		const session = await auth.api.getSession({ headers });
		if (!session?.user) throw redirect(loginUrl);
		pageContext.user = session.user;
	} catch (e) {
		if (e && typeof e === "object" && "_tag" in e) throw e;
		throw redirect(loginUrl);
	}
};
