import { Hono } from "hono";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";
import { localizePath } from "@/lib/i18n/paths";
import { db } from "../lib/db.js";
import { nameFromEmail, normalizeEmail } from "../lib/free-download.js";
import {
	isHalConfigured,
	requestNewsletterConfirmation,
	startWelcomeSeries,
	syncNewsletterSubscriberToHal,
} from "../lib/hal.js";
import { clientIp, isRateLimited } from "../lib/rate-limit.js";
import { requestLocale } from "../lib/recipe-i18n.js";
import { createSignedToken, verifySignedToken } from "../lib/signed-token.js";
import { verifyTurnstile } from "../lib/turnstile.js";

export const newsletterHandler = new Hono();

const TOKEN_PURPOSE = "newsletter";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const SOURCE_PATTERN = /^[a-z0-9-]{1,30}$/;

newsletterHandler.post("/", async (c) => {
	const body = (await c.req.json().catch(() => null)) as {
		email?: unknown;
		consent?: unknown;
		locale?: unknown;
		source?: unknown;
		turnstileToken?: unknown;
	} | null;
	const email = normalizeEmail(body?.email);
	if (!email) return c.json({ error: "Invalid email" }, 400);
	if (body?.consent !== true) return c.json({ error: "Consent required" }, 400);
	if (!isHalConfigured()) return c.json({ error: "Unavailable" }, 503);
	const locale = requestLocale(body?.locale);
	const source =
		typeof body?.source === "string" && SOURCE_PATTERN.test(body.source) ? body.source : "site";

	const ip = clientIp(c.req.raw.headers);
	if (
		(ip && isRateLimited(`news-ip:${ip}`, 10, 10 * 60_000)) ||
		isRateLimited(`news-email:${email}`, 3, 60 * 60_000) ||
		isRateLimited("news-global", 200, 10 * 60_000)
	) {
		return c.json({ error: "Too many requests" }, 429);
	}
	if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
		return c.json({ error: "Verification failed" }, 400);
	}

	// Consent is only recorded here; nothing is added to the mailing list until the
	// mailbox owner clicks the confirmation link (double opt-in).
	const signup = await db.newsletterSignup.create({
		data: {
			email,
			locale,
			source,
			consentText: translatorFor(locale)("common.newsletter.consent"),
			ipAddress: ip,
			userAgent: c.req.header("user-agent")?.slice(0, 500) ?? null,
		},
	});

	try {
		await requestNewsletterConfirmation({
			signupId: signup.id,
			email,
			name: nameFromEmail(email),
			token: createSignedToken(TOKEN_PURPOSE, signup.id, TOKEN_TTL_SECONDS),
			locale,
		});
	} catch (error) {
		console.error("Newsletter confirmation request failed", error);
		// A timeout may still have sent the email; otherwise drop the record of an email never sent.
		if (!(error instanceof Error && error.name === "TimeoutError")) {
			await db.newsletterSignup.delete({ where: { id: signup.id } }).catch(() => undefined);
		}
		return c.json({ error: "Email could not be sent" }, 502);
	}
	await db.newsletterSignup
		.update({ where: { id: signup.id }, data: { emailSentAt: new Date() } })
		.catch(() => undefined);

	return c.json({ ok: true });
});

function confirmedPage(locale: Locale, status: "ok" | "expired" | "invalid"): string {
	return `${localizePath("/newsletter/confirmed", locale)}?status=${status}`;
}

// The link in the confirmation email: this click is the proof of consent.
newsletterHandler.get("/confirm", async (c) => {
	c.header("Cache-Control", "private, no-store");
	const token = c.req.query("token");
	const verified = token ? verifySignedToken(TOKEN_PURPOSE, token) : null;
	if (!verified) return c.redirect(confirmedPage(DEFAULT_LOCALE, "invalid"));

	const signup = await db.newsletterSignup.findUnique({ where: { id: verified.id } });
	if (!signup) return c.redirect(confirmedPage(DEFAULT_LOCALE, "invalid"));
	const locale: Locale = isLocale(signup.locale) ? signup.locale : DEFAULT_LOCALE;
	// Read-only for an expired link: it must not confirm consent.
	if (verified.expired) return c.redirect(confirmedPage(locale, "expired"));

	if (!signup.confirmedAt) {
		await db.newsletterSignup.updateMany({
			where: { id: signup.id, confirmedAt: null },
			data: { confirmedAt: new Date() },
		});
	}

	// Retried on every open until it succeeds; event keys make every step idempotent.
	if (!signup.halSyncedAt && isHalConfigured()) {
		void syncNewsletterSubscriberToHal({
			signupId: signup.id,
			email: signup.email,
			name: nameFromEmail(signup.email),
			consentedAt: signup.consentedAt,
			locale,
			source: signup.source,
		})
			.then(async ({ contactId }) => {
				await startWelcomeSeries({ email: signup.email, locale });
				await db.newsletterSignup.update({
					where: { id: signup.id },
					data: { halContactId: contactId, halSyncedAt: new Date(), halError: null },
				});
			})
			.catch((error: unknown) => {
				console.error("Newsletter HAL sync failed", error);
				return db.newsletterSignup
					.update({
						where: { id: signup.id },
						data: {
							halError: String(error instanceof Error ? error.message : error).slice(0, 500),
						},
					})
					.catch(() => undefined);
			});
	}

	return c.redirect(confirmedPage(locale, "ok"));
});
