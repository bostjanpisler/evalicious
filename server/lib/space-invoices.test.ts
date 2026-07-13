import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { createPaidSpaceInvoice, sendSpaceInvoice } from "./space-invoices";

const originalFetch = globalThis.fetch;

beforeEach(() => {
	process.env.SPACE_INVOICES_API_KEY = "test-key";
	delete process.env.SPACE_INVOICES_ENTITY_ID;
	process.env.SPACE_INVOICES_API_URL = "https://space.test";
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	delete process.env.SPACE_INVOICES_API_KEY;
	delete process.env.SPACE_INVOICES_API_URL;
});

describe("Space Invoices client", () => {
	test("recovers an existing invoice by order metadata", async () => {
		const fetchMock = mock(async () =>
			Response.json({ data: [{ id: "inv_existing", number: "2026-001" }] }),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const invoice = await createPaidSpaceInvoice({
			orderId: "order_1",
			stripeSessionId: "cs_1",
			date: "2026-07-13",
			currency: "EUR",
			total: 29.9,
			customerName: "Test Customer",
			customerEmail: "customer@example.com",
			lines: [{ name: "E-book", grossPrice: 29.9, orderItemId: "item_1" }],
		});

		expect(invoice).toEqual({ id: "inv_existing", number: "2026-001" });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
		expect(requestUrl).toContain("/invoices?");
		expect(decodeURIComponent(requestUrl)).toContain(
			'"metadata":{"order_id":{"equals":"order_1"}}',
		);
	});

	test("creates a finalized paid invoice with gross pricing", async () => {
		const requests: Array<{ url: string; init?: RequestInit }> = [];
		const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
			requests.push({ url: String(url), init });
			if (requests.length === 1) return Response.json({ data: [] });
			return Response.json({ id: "inv_new", number: "2026-002" });
		});
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await createPaidSpaceInvoice({
			orderId: "order_2",
			stripeSessionId: "cs_2",
			stripePaymentIntentId: "pi_2",
			date: "2026-07-13",
			currency: "eur",
			total: 49,
			customerName: "Test Customer",
			customerEmail: "customer@example.com",
			lines: [{ name: "Course", grossPrice: 49, orderItemId: "item_2" }],
		});

		const createRequest = requests[1];
		expect(createRequest?.url).toBe("https://space.test/invoices");
		const createHeaders = new Headers(createRequest?.init?.headers);
		expect(createHeaders.get("x-entity-id")).toBe("ent_69ce51140ce840db07b19792");
		expect(createHeaders.get("x-request-id")).toBe("invoice-create-order_2");
		const body = JSON.parse(String(createRequest?.init?.body));
		expect(body).toMatchObject({
			is_draft: false,
			currency_code: "EUR",
			expected_total_with_tax: 49,
			metadata: { order_id: "order_2", stripe_session_id: "cs_2" },
			items: [
				{
					name: "Course",
					gross_price: 49,
					taxes: [],
				},
			],
			payments: [{ amount: 49, type: "card", reference: "pi_2" }],
		});
	});

	test("sends the invoice with its PDF attached", async () => {
		const fetchMock = mock(async () => Response.json({ status: "sent" }));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await sendSpaceInvoice("inv_1", "customer@example.com");

		const [url, init] = fetchMock.mock.calls[0] ?? [];
		expect(String(url)).toBe("https://space.test/documents/inv_1/send");
		expect(new Headers(init?.headers).get("x-request-id")).toBe("invoice-send-inv_1");
		expect(JSON.parse(String(init?.body))).toEqual({
			to: "customer@example.com",
			attach_pdf: true,
		});
	});
});
