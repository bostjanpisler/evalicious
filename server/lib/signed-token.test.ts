import { describe, expect, test } from "bun:test";
import { createSignedToken, verifySignedToken } from "./signed-token";

const key = "test-secret";
const now = Date.UTC(2026, 9, 8);

describe("signed tokens", () => {
	test("round-trip, and report expiry only for correctly signed tokens", () => {
		const token = createSignedToken("newsletter", "abc", 3600, now, key);
		expect(verifySignedToken("newsletter", token, now, key)).toEqual({ id: "abc", expired: false });
		expect(verifySignedToken("newsletter", token, now + 3601_000, key)).toEqual({
			id: "abc",
			expired: true,
		});
	});

	test("a token for one purpose does not work for another", () => {
		const token = createSignedToken("newsletter", "abc", 3600, now, key);
		expect(verifySignedToken("download", token, now, key)).toBeNull();
	});

	test("rejects tampering, a different key and malformed input", () => {
		const token = createSignedToken("newsletter", "abc", 3600, now, key);
		expect(verifySignedToken("newsletter", token.replace("abc", "abd"), now, key)).toBeNull();
		const [id, exp, sig] = token.split(".");
		expect(
			verifySignedToken("newsletter", `${id}.${Number(exp) + 99999}.${sig}`, now, key),
		).toBeNull();
		expect(verifySignedToken("newsletter", token, now, "other")).toBeNull();
		expect(verifySignedToken("newsletter", "x.y", now, key)).toBeNull();
	});

	test("is URL-safe", () => {
		expect(createSignedToken("newsletter", "cmuz55fx6000001qfj1j7wvuy", 3600, now, key)).toMatch(
			/^[A-Za-z0-9_.-]+$/,
		);
	});
});
