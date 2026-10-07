import { describe, expect, test } from "bun:test";
import { mergeTags, syncFreeDownloadLeadToHal } from "./hal";

const env = { HAL_API_KEY: "key" } as NodeJS.ProcessEnv;
const lead = {
	leadId: "lead_1",
	email: "Eva@Example.com",
	name: "eva",
	userId: "user_1",
	productSlug: "free-ebook",
	productTitle: "Free ebook",
	consentedAt: new Date("2026-10-07T10:00:00Z"),
};

function recorder(responses: Record<string, unknown>) {
	const calls: { route: string; body?: unknown }[] = [];
	const http = async (method: string, path: string, body?: unknown) => {
		const route = `${method} ${path.split("?")[0]}`;
		calls.push({ route, body });
		return responses[route] ?? {};
	};
	return { calls, http };
}

describe("mergeTags", () => {
	test("adds tags without duplicates", () => {
		expect(mergeTags(["vip", "free-download"], ["free-download", "eva-licious"])).toEqual([
			"vip",
			"free-download",
			"eva-licious",
		]);
	});
});

describe("syncFreeDownloadLeadToHal", () => {
	test("tracks the event, tags the contact, and puts a new company in the Lead stage", async () => {
		const { calls, http } = recorder({
			"POST /events/track": { event: { contact_id: "c_1" } },
			"GET /contacts/c_1": { contact: { id: "c_1", tags: [] } },
			"GET /companies": {
				companies: [{ id: "co_1", name: "eva@example.com", stage_id: null }],
			},
		});
		const result = await syncFreeDownloadLeadToHal(lead, env, http);

		expect(result).toEqual({ contactId: "c_1" });
		expect(calls.map((call) => call.route)).toEqual([
			"POST /events/track",
			"GET /contacts/c_1",
			"PATCH /contacts/c_1",
			"GET /companies",
			"PATCH /companies/co_1",
		]);
		expect(calls[0]?.body).toMatchObject({
			name: "free_download",
			event_key: "free_download:lead_1",
			email: "eva@example.com",
			user_id: "user_1",
			company_id: "user_1",
			metadata: { marketing_consent: true },
		});
		expect((calls[2]?.body as { tags: string[] }).tags).toContain("marketing-consent");
		expect(calls[4]?.body).toEqual({ stage_id: "cmuxrzm9d0ez82po7now5g8ba" });
	});

	test("keeps an existing pipeline stage and skips unchanged tags", async () => {
		const tags = ["eva-licious", "free-download", "marketing-consent", "download:free-ebook"];
		const { calls, http } = recorder({
			"POST /events/track": { event: { contact_id: "c_9" } },
			"GET /contacts/c_9": { contact: { id: "c_9", tags } },
			"GET /companies": {
				companies: [{ id: "co_9", name: "eva@example.com", stage_id: "won" }],
			},
		});
		await syncFreeDownloadLeadToHal(lead, env, http);

		expect(calls.map((call) => call.route)).toEqual([
			"POST /events/track",
			"GET /contacts/c_9",
			"GET /companies",
		]);
	});
});
