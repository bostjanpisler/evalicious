import type { OnBeforeRenderAsync } from "vike/types";
import { auth } from "@/server/lib/auth";

export const onBeforeRender: OnBeforeRenderAsync = async (pageContext) => {
	let user = null;

	try {
		const headers = pageContext.headers;
		if (headers) {
			const session = await auth.api.getSession({ headers: new Headers(headers) });
			user = session?.user ?? null;
		}
	} catch {
		// No session
	}

	return {
		pageContext: {
			user,
			turnstileSiteKey:
				process.env.TURNSTILE_SECRET?.trim() && process.env.TURNSTILE_SITE_KEY?.trim()
					? process.env.TURNSTILE_SITE_KEY.trim()
					: null,
		},
	};
};
