// Cloudflare Turnstile bot check for public forms. Inactive until TURNSTILE_SECRET is set
// (and the site key is configured for the page), so the forms work without it.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	return !!env.TURNSTILE_SECRET?.trim();
}

/**
 * True when the visitor passed the challenge, or when the check is not configured.
 * A Cloudflare outage must not take the forms down, so a failed lookup lets the request
 * through (the per-IP/email rate limits still apply); a rejected or missing token does not.
 */
export async function verifyTurnstile(
	token: unknown,
	ip: string | null,
	env: NodeJS.ProcessEnv = process.env,
	fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
	const secret = env.TURNSTILE_SECRET?.trim();
	if (!secret) return true;
	if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;
	try {
		const response = await fetchImpl(VERIFY_URL, {
			method: "POST",
			signal: AbortSignal.timeout(5_000),
			body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
		});
		if (!response.ok) return true;
		const result = (await response.json()) as { success?: boolean };
		return result.success === true;
	} catch {
		return true;
	}
}
