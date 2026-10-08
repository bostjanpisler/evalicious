import { describe, expect, test } from "bun:test";
import {
	createFreeDownloadToken,
	FREE_DOWNLOAD_LINK_TTL_SECONDS,
	nameFromEmail,
	normalizeEmail,
	verifyFreeDownloadToken,
} from "./free-download";

const secret = "test-secret";
const now = Date.UTC(2026, 9, 7);

describe("free download tokens", () => {
	test("round-trips the lead id", () => {
		const token = createFreeDownloadToken("lead_1", now, secret);
		expect(verifyFreeDownloadToken(token, now, secret)).toEqual({
			leadId: "lead_1",
			expired: false,
		});
	});

	test("rejects tampered tokens and a different secret", () => {
		const token = createFreeDownloadToken("lead_1", now, secret);
		expect(verifyFreeDownloadToken(token.replace("lead_1", "lead_2"), now, secret)).toBeNull();
		expect(verifyFreeDownloadToken(token, now, "other-secret")).toBeNull();
		expect(verifyFreeDownloadToken("garbage", now, secret)).toBeNull();
	});

	test("rejects a token whose expiry was extended without re-signing", () => {
		const token = createFreeDownloadToken("lead_1", now, secret);
		const [id, expiry, sig] = token.split(".");
		const extended = `${id}.${Number(expiry) + 10 * 24 * 3600}.${sig}`;
		expect(verifyFreeDownloadToken(extended, now, secret)).toBeNull();
	});

	test("flags a correctly signed token as expired after its lifetime", () => {
		const token = createFreeDownloadToken("lead_1", now, secret);
		const later = now + (FREE_DOWNLOAD_LINK_TTL_SECONDS + 1) * 1000;
		expect(verifyFreeDownloadToken(token, later, secret)).toEqual({
			leadId: "lead_1",
			expired: true,
		});
	});

	test("is URL-safe so it can be dropped into a link unencoded", () => {
		const token = createFreeDownloadToken("cmuxs46z80f0d2po7tu8wo176", now, secret);
		expect(token).toMatch(/^[A-Za-z0-9_.-]+$/);
	});
});

describe("normalizeEmail", () => {
	test("trims and lowercases valid addresses", () => {
		expect(normalizeEmail("  Eva@Example.COM ")).toBe("eva@example.com");
	});

	test("rejects invalid input", () => {
		expect(normalizeEmail("not-an-email")).toBeNull();
		expect(normalizeEmail(42)).toBeNull();
		expect(normalizeEmail(`${"a".repeat(250)}@x.si`)).toBeNull();
	});

	test("derives a display name from the local part", () => {
		expect(nameFromEmail("eva.k@example.com")).toBe("eva.k");
	});
});
