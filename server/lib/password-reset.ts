import { SITE_URL } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/paths";
import { sendPasswordResetEmail } from "./email.js";
import { isHalConfigured, requestPasswordResetEmail } from "./hal.js";
import { isRateLimited } from "./rate-limit.js";

const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60_000;
const GLOBAL_LIMIT = 200;
const GLOBAL_WINDOW_MS = 10 * 60_000;

/**
 * The form posts `redirectTo` as the localized /reset-password path, and Better Auth
 * echoes it in the link it hands us, which is how the email learns the language.
 */
export function resetLocale(betterAuthUrl: string): Locale {
	const callback = new URL(betterAuthUrl).searchParams.get("callbackURL") ?? "";
	return callback === "/en" || callback.startsWith("/en/") ? "en" : DEFAULT_LOCALE;
}

/** The link in the email. The token travels in the fragment so it stays out of logs. */
export function resetUrl(token: string, locale: Locale): string {
	return `${SITE_URL}${localizePath("/reset-password", locale)}#token=${encodeURIComponent(token)}`;
}

/**
 * Better Auth's sendResetPassword hook. It only runs for existing accounts, and its
 * response never reveals that, so over-limit requests are dropped silently here too.
 */
export async function sendResetPassword(input: {
	user: { email: string; name: string };
	url: string;
	token: string;
}): Promise<void> {
	const email = input.user.email.toLowerCase();
	if (
		isRateLimited(`reset-email:${email}`, EMAIL_LIMIT, EMAIL_WINDOW_MS) ||
		isRateLimited("reset-global", GLOBAL_LIMIT, GLOBAL_WINDOW_MS)
	) {
		return;
	}
	const locale = resetLocale(input.url);
	try {
		if (isHalConfigured()) {
			await requestPasswordResetEmail({
				email,
				name: input.user.name,
				token: input.token,
				locale,
			});
		} else {
			await sendPasswordResetEmail(email, resetUrl(input.token, locale), locale);
		}
	} catch (error) {
		console.error("Password reset email failed", error);
	}
}
