export const DEFAULT_AUTH_REDIRECT = "/dashboard/my-recipes";

/** Accept only same-site absolute paths so auth redirects cannot become open redirects. */
export function getSafeRedirect(value: string | null | undefined): string {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return DEFAULT_AUTH_REDIRECT;
	}

	try {
		const url = new URL(value, "https://eva-licious.com");
		if (url.origin !== "https://eva-licious.com") return DEFAULT_AUTH_REDIRECT;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return DEFAULT_AUTH_REDIRECT;
	}
}
