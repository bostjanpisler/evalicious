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
	test("round-trips the lead id for the same product", () => {
		const token = createFreeDownloadToken("lead_1", "ebook", now, secret);
		expect(verifyFreeDownloadToken(token, "ebook", now, secret)).toBe("lead_1");
	});

	test("rejects a token used for another product", () => {
		const token = createFreeDownloadToken("lead_1", "ebook", now, secret);
		expect(verifyFreeDownloadToken(token, "other-ebook", now, secret)).toBeNull();
	});

	test("rejects tampered and expired tokens", () => {
		const token = createFreeDownloadToken("lead_1", "ebook", now, secret);
		expect(verifyFreeDownloadToken(token.replace("lead_1", "lead_2"), "ebook", now, secret)).toBeNull();
		expect(verifyFreeDownloadToken(token, "ebook", now, "other-secret")).toBeNull();
		const later = now + (FREE_DOWNLOAD_LINK_TTL_SECONDS + 1) * 1000;
		expect(verifyFreeDownloadToken(token, "ebook", later, secret)).toBeNull();
		expect(verifyFreeDownloadToken("garbage", "ebook", now, secret)).toBeNull();
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
