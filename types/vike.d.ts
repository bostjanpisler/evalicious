type AuthenticatedUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role: string;
};

declare global {
	namespace Vike {
		interface PageContext {
			user: AuthenticatedUser | null;
			locale: import("../lib/i18n/config").Locale;
			/** Public Cloudflare Turnstile site key; null when bot checks are not configured. */
			turnstileSiteKey: string | null;
		}
	}
}

export {};
