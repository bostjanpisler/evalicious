import { redirect } from "vike/abort";
import type { GuardAsync } from "vike/types";
import { auth } from "@/server/lib/auth";

export const guard: GuardAsync = async (pageContext) => {
	const headers = pageContext.headers ? new Headers(pageContext.headers) : null;
	if (!headers) throw redirect("/login");

	try {
		const session = await auth.api.getSession({ headers });
		if (!session?.user) throw redirect("/login");
		pageContext.user = session.user;
	} catch (e) {
		if (e && typeof e === "object" && "_tag" in e) throw e;
		throw redirect("/login");
	}
};
