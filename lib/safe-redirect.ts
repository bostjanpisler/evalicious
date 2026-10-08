export const DEFAULT_AUTH_REDIRECT = "/dashboard/my-recipes";

/**
 * Accept only same-site absolute paths so auth redirects cannot become open redirects.
 * Locale-prefixed paths such as /en/dashboard/my-recipes are ordinary same-site paths.
 * Pass a localized `fallback` (e.g. l(DEFAULT_AUTH_REDIRECT)) to keep visitors in their language.
 */
export function getSafeRedirect(
	value: string | null | undefined,
	fallback: string = DEFAULT_AUTH_REDIRECT,
): string {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return fallback;
	}

	try {
		const url = new URL(value, "https://eva-licious.com");
		if (url.origin !== "https://eva-licious.com") return fallback;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
