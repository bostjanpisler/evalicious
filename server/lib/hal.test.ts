import { describe, expect, test } from "bun:test";
import {
	markCustomerInHal,
	mergeTags,
	requestFreeDownloadEmail,
	requestNewsletterConfirmation,
	requestPurchaseEmail,
	startWelcomeSeries,
	syncFreeDownloadLeadToHal,
	syncNewsletterSubscriberToHal,
} from "./hal";

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
			name: "free-download-confirmed",
			event_key: "free-download-confirmed:lead_1",
			email: "eva@example.com",
			user_id: "user_1",
			company_id: "user_1",
			metadata: { marketing_consent: true },
		});
		expect((calls[2]?.body as { tags: string[] }).tags).toContain("marketing-consent");
		expect(calls[4]?.body).toEqual({ stage_id: "cmuxrzm9d0ez82po7now5g8ba" });
	});

	test("keeps an existing pipeline stage and skips unchanged tags", async () => {
		const tags = [
			"eva-licious",
			"free-download",
			"marketing-consent",
			"download:free-ebook",
			"lang:sl",
		];
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

describe("requestFreeDownloadEmail", () => {
	test("tracks the request event with the per-lead link as contact properties, without consent", async () => {
		const { calls, http } = recorder({});
		await requestFreeDownloadEmail(
			{
				leadId: "lead_1",
				email: "Eva@Example.com",
				productSlug: "free-ebook",
				productTitle: "Free ebook",
				downloadToken: "lead_1.123.sig",
				needsAccount: true,
				name: "eva",
			},
			env,
			http,
		);

		expect(calls).toHaveLength(1);
		expect(calls[0]?.route).toBe("POST /events/track");
		expect(calls[0]?.body).toMatchObject({
			name: "free-download-requested",
			event_key: "free-download-requested:lead_1",
			email: "eva@example.com",
			metadata: {
				download_title: "Free ebook",
				download_token: "lead_1.123.sig",
				needs_account: "yes",
			},
			overwrite_metadata: true,
		});
		expect(JSON.stringify(calls[0]?.body)).not.toContain("marketing_consent");
	});
});

describe("newsletter", () => {
	test("the confirmation request goes out per language and records no consent", async () => {
		const { calls, http } = recorder({});
		await requestNewsletterConfirmation(
			{ signupId: "s1", email: "Eva@Example.com", name: "eva", token: "s1.123.sig", locale: "en" },
			env,
			http,
		);
		expect(calls[0]?.route).toBe("POST /events/track");
		expect(calls[0]?.body).toMatchObject({
			name: "newsletter-confirm-requested-en",
			event_key: "newsletter-confirm-requested:s1",
			email: "eva@example.com",
			metadata: { confirm_token: "s1.123.sig", language: "en" },
		});
		expect(JSON.stringify(calls[0]?.body)).not.toContain("marketing_consent");
	});

	test("a confirmed subscriber is synced with consent, tags and the Lead stage, without a user id", async () => {
		const { calls, http } = recorder({
			"POST /events/track": { event: { contact_id: "c_1" } },
			"GET /contacts/c_1": { contact: { id: "c_1", tags: [] } },
			"GET /companies": { companies: [{ id: "co_1", name: "eva@example.com", stage_id: null }] },
		});
		const result = await syncNewsletterSubscriberToHal(
			{
				signupId: "s1",
				email: "Eva@Example.com",
				name: "eva",
				consentedAt: new Date("2026-10-08T10:00:00Z"),
				source: "footer",
				locale: "sl",
			},
			env,
			http,
		);
		expect(result).toEqual({ contactId: "c_1" });
		expect(calls[0]?.body).toMatchObject({
			name: "newsletter-confirmed",
			event_key: "newsletter-confirmed:s1",
			company_id: "subscriber:s1",
			metadata: { marketing_consent: true, language: "sl", newsletter_source: "footer" },
		});
		expect("user_id" in (calls[0]?.body as object)).toBe(false);
		const tags = (calls.find((c) => c.route === "PATCH /contacts/c_1")?.body as { tags: string[] })
			.tags;
		expect(tags).toEqual(expect.arrayContaining(["newsletter", "marketing-consent", "lang:sl"]));
		expect(calls.map((c) => c.route)).toContain("PATCH /companies/co_1");
	});

	test("the welcome series starts once per address, in the subscriber's language", async () => {
		const { calls, http } = recorder({});
		await startWelcomeSeries({ email: "Eva@Example.com", locale: "en" }, env, http);
		expect(calls[0]?.body).toMatchObject({
			name: "welcome-series-start-en",
			event_key: "welcome-series:eva@example.com",
			email: "eva@example.com",
		});
	});
});

describe("requestPurchaseEmail", () => {
	test("picks the workflow by product kind and language, keyed by order", async () => {
		const { calls, http } = recorder({});
		const base = {
			orderId: "ord_1",
			email: "Buyer@Example.com",
			name: "buyer",
			productSlug: "guide",
			productTitle: "Guide",
		};
		await requestPurchaseEmail(
			{ ...base, downloadToken: "order_1.123.sig", locale: "en" },
			env,
			http,
		);
		await requestPurchaseEmail(base, env, http);
		const [ebook, course] = calls.map((call) => call.body as Record<string, unknown>);
		expect(ebook?.name).toBe("purchase-ebook-en");
		expect(ebook?.event_key).toBe("purchase-email:ord_1");
		expect(ebook?.email).toBe("buyer@example.com");
		expect(ebook?.overwrite_metadata).toBe(true);
		expect((ebook?.metadata as Record<string, unknown>).purchase_download_token).toBe(
			"order_1.123.sig",
		);
		expect(course?.name).toBe("purchase-course");
	});
});

describe("markCustomerInHal", () => {
	const customer = {
		orderId: "ord_1",
		userId: "user_1",
		email: "Buyer@Example.com",
		name: "buyer",
		productSlug: "guide",
		purchasedAt: new Date("2026-10-08T10:00:00Z"),
	};

	test("tags the buyer and moves the company to Won", async () => {
		const { calls, http } = recorder({
			"POST /events/track": { event: { contact_id: "c_1" } },
			"GET /contacts/c_1": { contact: { id: "c_1", tags: ["newsletter"] } },
			"GET /companies": {
				companies: [{ id: "co_1", name: "buyer@example.com", stage_id: "lead" }],
			},
		});
		await markCustomerInHal(customer, { ...env, HAL_WON_STAGE_ID: "won" }, http);
		expect(calls.find((call) => call.route === "PATCH /contacts/c_1")?.body).toEqual({
			tags: ["newsletter", "eva-licious", "customer", "purchased:guide"],
		});
		expect(calls.find((call) => call.route === "PATCH /companies/co_1")?.body).toEqual({
			stage_id: "won",
		});
		const event = calls[0]?.body as Record<string, unknown>;
		expect((event.metadata as Record<string, unknown>).marketing_consent).toBeUndefined();
	});

	test("leaves a company that is already Won alone", async () => {
		const { calls, http } = recorder({
			"POST /events/track": { event: { contact_id: "c_1" } },
			"GET /contacts/c_1": {
				contact: { id: "c_1", tags: ["eva-licious", "customer", "purchased:guide"] },
			},
			"GET /companies": {
				companies: [{ id: "co_1", name: "buyer@example.com", stage_id: "won" }],
			},
		});
		await markCustomerInHal(customer, { ...env, HAL_WON_STAGE_ID: "won" }, http);
		expect(calls.some((call) => call.route.startsWith("PATCH"))).toBe(false);
	});
});
