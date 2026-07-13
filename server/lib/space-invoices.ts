const DEFAULT_API_URL = "https://eu.spaceinvoices.com";
const DEFAULT_ENTITY_ID = "ent_69ce51140ce840db07b19792";

export interface SpaceInvoiceLine {
	name: string;
	grossPrice: number;
	orderItemId: string;
}

export interface CreatePaidSpaceInvoiceInput {
	orderId: string;
	stripeSessionId: string;
	stripePaymentIntentId?: string;
	date: string;
	currency: string;
	total: number;
	customerName: string;
	customerEmail: string;
	lines: SpaceInvoiceLine[];
}

export interface SpaceInvoice {
	id: string;
	number: string;
}

interface SpaceInvoiceListResponse {
	data: SpaceInvoice[];
}

function getConfig() {
	const apiKey = process.env.SPACE_INVOICES_API_KEY;
	const entityId = process.env.SPACE_INVOICES_ENTITY_ID ?? DEFAULT_ENTITY_ID;

	if (!apiKey) {
		throw new Error("SPACE_INVOICES_API_KEY must be configured");
	}

	return {
		apiKey,
		entityId,
		apiUrl: process.env.SPACE_INVOICES_API_URL ?? DEFAULT_API_URL,
	};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const { apiKey, entityId, apiUrl } = getConfig();
	const response = await fetch(`${apiUrl}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
			"x-entity-id": entityId,
			...init?.headers,
		},
		signal: AbortSignal.timeout(20_000),
	});

	if (!response.ok) {
		const detail = (await response.text()).slice(0, 500);
		throw new Error(
			`Space Invoices request failed (${response.status}): ${detail || response.statusText}`,
		);
	}

	return response.json() as Promise<T>;
}

async function findInvoiceByOrderId(orderId: string): Promise<SpaceInvoice | null> {
	const query = JSON.stringify({ metadata: { order_id: { equals: orderId } } });
	const params = new URLSearchParams({ limit: "1", query });
	const response = await request<SpaceInvoiceListResponse>(`/invoices?${params}`);
	return response.data[0] ?? null;
}

export async function createPaidSpaceInvoice(
	input: CreatePaidSpaceInvoiceInput,
): Promise<SpaceInvoice> {
	const existingInvoice = await findInvoiceByOrderId(input.orderId);
	if (existingInvoice) return existingInvoice;

	return request<SpaceInvoice>("/invoices", {
		method: "POST",
		headers: { "X-Request-Id": `invoice-create-${input.orderId}` },
		body: JSON.stringify({
			is_draft: false,
			date: input.date,
			date_due: input.date,
			date_service: input.date,
			currency_code: input.currency.toUpperCase(),
			calculation_mode: "b2c_gross_discount",
			customer: {
				name: input.customerName,
				email: input.customerEmail,
				is_end_consumer: true,
				save_customer: false,
			},
			items: input.lines.map((line) => ({
				name: line.name,
				quantity: 1,
				gross_price: line.grossPrice,
				taxes: [],
				save_item: false,
				metadata: { order_item_id: line.orderItemId },
			})),
			payments: [
				{
					amount: input.total,
					type: "card",
					date: input.date,
					reference: input.stripePaymentIntentId,
					metadata: {
						processor: "stripe",
						stripe_session_id: input.stripeSessionId,
					},
				},
			],
			expected_total_with_tax: input.total,
			metadata: {
				order_id: input.orderId,
				stripe_session_id: input.stripeSessionId,
			},
		}),
	});
}

export async function sendSpaceInvoice(invoiceId: string, to: string): Promise<void> {
	await request(`/documents/${encodeURIComponent(invoiceId)}/send`, {
		method: "POST",
		headers: { "X-Request-Id": `invoice-send-${invoiceId}` },
		body: JSON.stringify({
			to,
			attach_pdf: true,
		}),
	});
}
