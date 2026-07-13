import { db } from "./db.js";
import { sanityClient } from "./sanity.js";
import { createPaidSpaceInvoice, sendSpaceInvoice } from "./space-invoices.js";

function toCurrencyAmount(cents: number): number {
	return Number((cents / 100).toFixed(2));
}

export function formatInvoiceDate(
	date: Date,
	timeZone = process.env.SPACE_INVOICES_TIME_ZONE ?? "Europe/Ljubljana",
): string {
	const parts = new Intl.DateTimeFormat("en", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${values.day}`;
}

export async function issueOrderInvoice(orderId: string): Promise<void> {
	const order = await db.order.findUnique({
		where: { id: orderId },
		include: {
			user: true,
			items: { include: { product: true } },
		},
	});

	if (!order) throw new Error(`Order ${orderId} not found`);
	if (order.status !== "completed" || !order.stripeSessionId) {
		throw new Error(`Order ${orderId} is not eligible for invoicing`);
	}
	if (order.spaceInvoiceSentAt) return;

	let invoiceId = order.spaceInvoiceId;
	if (!invoiceId) {
		const sanityIds = order.items.map((item) => item.product.sanityId);
		const sanityProducts = await sanityClient
			.fetch<Array<{ _id: string; title: string }>>(
				`*[_type == "product" && _id in $ids]{ _id, title }`,
				{ ids: sanityIds },
			)
			.catch(() => []);
		const titles = new Map((sanityProducts ?? []).map((product) => [product._id, product.title]));
		const itemTotalInCents = order.items.reduce((total, item) => total + item.priceInCents, 0);
		const totalAdjustment = order.totalInCents - itemTotalInCents;

		const invoice = await createPaidSpaceInvoice({
			orderId: order.id,
			stripeSessionId: order.stripeSessionId,
			stripePaymentIntentId: order.stripePaymentIntentId ?? undefined,
			date: formatInvoiceDate(order.createdAt),
			currency: order.currency,
			total: toCurrencyAmount(order.totalInCents),
			customerName: order.user.name,
			customerEmail: order.email || order.user.email,
			lines: order.items.map((item, index) => ({
				name: titles.get(item.product.sanityId) ?? item.product.slug,
				grossPrice: toCurrencyAmount(
					item.priceInCents + (index === order.items.length - 1 ? totalAdjustment : 0),
				),
				orderItemId: item.id,
			})),
		});

		invoiceId = invoice.id;
		await db.order.update({
			where: { id: order.id },
			data: {
				spaceInvoiceId: invoice.id,
				spaceInvoiceNumber: invoice.number,
				spaceInvoiceIssuedAt: new Date(),
				spaceInvoiceError: null,
			},
		});
	}

	await sendSpaceInvoice(invoiceId, order.email || order.user.email);
	await db.order.update({
		where: { id: order.id },
		data: {
			spaceInvoiceSentAt: new Date(),
			spaceInvoiceError: null,
		},
	});
}
