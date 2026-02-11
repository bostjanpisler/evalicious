import type { GuardAsync } from "vike/types";
import { redirect } from "vike/abort";
import { auth } from "@/server/lib/auth";

export const guard: GuardAsync = async (pageContext) => {
	const headers = (pageContext as Record<string, unknown>).headersOriginal as
		| Headers
		| undefined;
	if (!headers) throw redirect("/login");

	try {
		const session = await auth.api.getSession({ headers });
		if (!session?.user) throw redirect("/login");
		(pageContext as Record<string, unknown>).user = session.user;
	} catch (e) {
		if (e && typeof e === "object" && "_tag" in e) throw e;
		throw redirect("/login");
	}
};
