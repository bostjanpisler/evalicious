import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { auth } from "./auth.js";
import { db } from "./db.js";

export const FREE_DOWNLOAD_LINK_TTL_SECONDS = 7 * 24 * 60 * 60;
export const PASSWORD_SETUP_TTL_SECONDS = 7 * 24 * 60 * 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(input: unknown): string | null {
	if (typeof input !== "string") return null;
	const email = input.trim().toLowerCase();
	if (email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
	return email;
}

function getSecret(): string {
	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured");
	return secret;
}

function sign(payload: string, secret: string): string {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Stateless link token `<leadId>.<expiresAtUnix>.<hmac>`. The product is looked
 * up from the lead, so the token alone identifies the download and is safe to
 * hand to an email template as a single variable.
 */
export function createFreeDownloadToken(
	leadId: string,
	now = Date.now(),
	secret = getSecret(),
): string {
	const expiresAt = Math.floor(now / 1000) + FREE_DOWNLOAD_LINK_TTL_SECONDS;
	return `${leadId}.${expiresAt}.${sign(`${leadId}.${expiresAt}`, secret)}`;
}

/** Returns the lead for a correctly signed token; `expired` is set past its lifetime. */
export function verifyFreeDownloadToken(
	token: string,
	now = Date.now(),
	secret = getSecret(),
): { leadId: string; expired: boolean } | null {
	const [leadId, expiresAtRaw, signature, ...rest] = token.split(".");
	if (!leadId || !expiresAtRaw || !signature || rest.length > 0) return null;
	const expiresAt = Number(expiresAtRaw);
	if (!Number.isInteger(expiresAt)) return null;
	const expected = Buffer.from(sign(`${leadId}.${expiresAt}`, secret));
	const actual = Buffer.from(signature);
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
	return { leadId, expired: expiresAt * 1000 < now };
}

export function nameFromEmail(email: string): string {
	return email.split("@")[0]?.slice(0, 100) || email;
}

/**
 * Returns the user for this email, creating a passwordless account when none
 * exists. `needsPassword` is true when the user has no credential and no
 * social login, so the email should invite them to set a password.
 */
export async function ensureLeadUser(
	email: string,
): Promise<{ id: string; name: string; created: boolean; needsPassword: boolean }> {
	const existing = await db.user.findUnique({
		where: { email },
		include: { accounts: { select: { providerId: true } } },
	});
	if (existing) {
		return {
			id: existing.id,
			name: existing.name,
			created: false,
			needsPassword: existing.accounts.length === 0,
		};
	}
	try {
		const user = await db.user.create({ data: { email, name: nameFromEmail(email) } });
		return { id: user.id, name: user.name, created: true, needsPassword: true };
	} catch (error) {
		// Concurrent request created the same user first.
		const user = await db.user.findUnique({ where: { email } });
		if (!user) throw error;
		return { id: user.id, name: user.name, created: false, needsPassword: true };
	}
}

/**
 * Issues a Better Auth password-reset token so a lead account can set its
 * first password at /reset-password. Better Auth's reset endpoint creates the
 * credential account when the user has none.
 */
export async function createPasswordSetupToken(userId: string): Promise<string> {
	const token = randomBytes(24).toString("base64url");
	const context = await auth.$context;
	await context.internalAdapter.createVerificationValue({
		identifier: `reset-password:${token}`,
		value: userId,
		expiresAt: new Date(Date.now() + PASSWORD_SETUP_TTL_SECONDS * 1000),
	});
	return token;
}

/** True when this email already belongs to a user who can sign in. */
export async function emailHasLogin(email: string): Promise<boolean> {
	const user = await db.user.findUnique({
		where: { email },
		select: { accounts: { select: { id: true }, take: 1 } },
	});
	return (user?.accounts.length ?? 0) > 0;
}

/**
 * Called when the mailbox owner first opens a link from the email: that click
 * is the proof of consent, so only now is the account created and the lead
 * confirmed.
 */
export async function confirmLead(leadId: string) {
	const lead = await db.freeDownloadLead.findUnique({
		where: { id: leadId },
		include: { product: { select: { slug: true } } },
	});
	if (!lead) return null;
	const user = await ensureLeadUser(lead.email);
	await db.freeDownloadLead.updateMany({
		where: { id: lead.id, confirmedAt: null },
		data: { confirmedAt: new Date(), userId: user.id },
	});
	return { lead, user };
}
