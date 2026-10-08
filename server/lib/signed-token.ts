import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless link tokens `<id>.<expiresAtUnix>.<hmac>`. The HMAC covers the purpose,
// so a token issued for one flow (newsletter confirmation) is worthless in another.

function secret(): string {
	const value = process.env.BETTER_AUTH_SECRET;
	if (!value) throw new Error("BETTER_AUTH_SECRET is not configured");
	return value;
}

function sign(purpose: string, id: string, expiresAt: number, key: string): string {
	return createHmac("sha256", key).update(`${purpose}.${id}.${expiresAt}`).digest("base64url");
}

export function createSignedToken(
	purpose: string,
	id: string,
	ttlSeconds: number,
	now = Date.now(),
	key = secret(),
): string {
	const expiresAt = Math.floor(now / 1000) + ttlSeconds;
	return `${id}.${expiresAt}.${sign(purpose, id, expiresAt, key)}`;
}

export function verifySignedToken(
	purpose: string,
	token: string,
	now = Date.now(),
	key = secret(),
): { id: string; expired: boolean } | null {
	const [id, expiresRaw, signature, ...rest] = token.split(".");
	if (!id || !expiresRaw || !signature || rest.length > 0) return null;
	const expiresAt = Number(expiresRaw);
	if (!Number.isInteger(expiresAt)) return null;
	const expected = Buffer.from(sign(purpose, id, expiresAt, key));
	const actual = Buffer.from(signature);
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
	return { id, expired: expiresAt * 1000 < now };
}
