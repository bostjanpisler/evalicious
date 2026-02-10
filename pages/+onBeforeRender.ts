import type { OnBeforeRenderAsync } from "vike/types";
import { auth } from "@/server/lib/auth";

export const onBeforeRender: OnBeforeRenderAsync = async (pageContext) => {
	let user = null;

	try {
		const headers = pageContext.headersOriginal;
		if (headers) {
			const session = await auth.api.getSession({ headers });
			user = session?.user ?? null;
		}
	} catch {
		// No session
	}

	return {
		pageContext: {
			user,
		},
	};
};
