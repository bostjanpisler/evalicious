import { describe, expect, test } from "bun:test";
import { clientIp, isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
	test("allows up to the limit per window, then blocks until it resets", () => {
		const key = `t-${Math.random()}`;
		expect(isRateLimited(key, 2, 1000, 0)).toBe(false);
		expect(isRateLimited(key, 2, 1000, 1)).toBe(false);
		expect(isRateLimited(key, 2, 1000, 2)).toBe(true);
		expect(isRateLimited(key, 2, 1000, 1001)).toBe(false);
	});
});

describe("clientIp", () => {
	test("prefers X-Real-IP and ignores a client-supplied first X-Forwarded-For entry", () => {
		expect(
			clientIp(new Headers({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9, 5.6.7.8" })),
		).toBe("1.2.3.4");
		expect(clientIp(new Headers({ "x-forwarded-for": "9.9.9.9, 5.6.7.8" }))).toBe("5.6.7.8");
		expect(clientIp(new Headers())).toBeNull();
	});
});
