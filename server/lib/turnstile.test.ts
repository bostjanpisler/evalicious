import { describe, expect, test } from "bun:test";
import { isTurnstileEnabled, verifyTurnstile } from "./turnstile";

const env = { TURNSTILE_SECRET: "s" } as NodeJS.ProcessEnv;
const reply = (body: unknown, ok = true) =>
	(async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

describe("verifyTurnstile", () => {
	test("is a no-op until a secret is configured", async () => {
		expect(isTurnstileEnabled({} as NodeJS.ProcessEnv)).toBe(false);
		expect(await verifyTurnstile(undefined, null, {} as NodeJS.ProcessEnv)).toBe(true);
	});

	test("requires a token and Cloudflare's approval once configured", async () => {
		expect(await verifyTurnstile(undefined, null, env, reply({ success: true }))).toBe(false);
		expect(await verifyTurnstile("t", null, env, reply({ success: false }))).toBe(false);
		expect(await verifyTurnstile("t", "1.2.3.4", env, reply({ success: true }))).toBe(true);
	});

	test("a Cloudflare outage does not block the form", async () => {
		expect(await verifyTurnstile("t", null, env, reply({}, false))).toBe(true);
		const down = (async () => {
			throw new Error("network");
		}) as unknown as typeof fetch;
		expect(await verifyTurnstile("t", null, env, down)).toBe(true);
	});
});
