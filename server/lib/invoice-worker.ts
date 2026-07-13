import { db } from "./db.js";
import { issueOrderInvoice } from "./order-invoicing.js";

const POLL_INTERVAL_MS = 30_000;
const LEASE_DURATION_MS = 5 * 60_000;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60_000;

interface InvoiceWorkerDependencies {
	claim(orderId: string, now: Date, leaseExpiredAt: Date): Promise<{ attempts: number } | null>;
	issue(orderId: string): Promise<void>;
	markSent(orderId: string): Promise<void>;
	markFailed(orderId: string, error: string, nextTryAt: Date): Promise<void>;
	now(): Date;
}

const dependencies: InvoiceWorkerDependencies = {
	async claim(orderId, now, leaseExpiredAt) {
		const result = await db.order.updateMany({
			where: {
				id: orderId,
				status: "completed",
				spaceInvoiceSentAt: null,
				spaceInvoiceNextTryAt: { lte: now },
				OR: [{ spaceInvoiceWorkingAt: null }, { spaceInvoiceWorkingAt: { lt: leaseExpiredAt } }],
			},
			data: {
				spaceInvoiceWorkingAt: now,
				spaceInvoiceAttempts: { increment: 1 },
			},
		});
		if (result.count === 0) return null;

		const order = await db.order.findUniqueOrThrow({
			where: { id: orderId },
			select: { spaceInvoiceAttempts: true },
		});
		return { attempts: order.spaceInvoiceAttempts };
	},
	issue: issueOrderInvoice,
	async markSent(orderId) {
		await db.order.update({
			where: { id: orderId },
			data: {
				spaceInvoiceWorkingAt: null,
				spaceInvoiceNextTryAt: null,
				spaceInvoiceError: null,
			},
		});
	},
	async markFailed(orderId, error, nextTryAt) {
		await db.order.update({
			where: { id: orderId },
			data: {
				spaceInvoiceWorkingAt: null,
				spaceInvoiceNextTryAt: nextTryAt,
				spaceInvoiceError: error.slice(0, 1000),
			},
		});
	},
	now: () => new Date(),
};

export function invoiceRetryDelayMs(attempts: number): number {
	return Math.min(30_000 * 2 ** Math.max(0, attempts - 1), MAX_RETRY_DELAY_MS);
}

export async function processInvoiceJob(
	orderId: string,
	deps: InvoiceWorkerDependencies = dependencies,
	now = new Date(),
): Promise<"skipped" | "sent" | "retry"> {
	const leaseExpiredAt = new Date(now.getTime() - LEASE_DURATION_MS);
	const claim = await deps.claim(orderId, now, leaseExpiredAt);
	if (!claim) return "skipped";

	try {
		await deps.issue(orderId);
		await deps.markSent(orderId);
		return "sent";
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown invoice error";
		const nextTryAt = new Date(deps.now().getTime() + invoiceRetryDelayMs(claim.attempts));
		await deps.markFailed(orderId, message, nextTryAt);
		return "retry";
	}
}

export async function runInvoiceWorkerTick(): Promise<void> {
	const now = new Date();
	const leaseExpiredAt = new Date(now.getTime() - LEASE_DURATION_MS);
	const orders = await db.order.findMany({
		where: {
			status: "completed",
			spaceInvoiceSentAt: null,
			spaceInvoiceNextTryAt: { lte: now },
			OR: [{ spaceInvoiceWorkingAt: null }, { spaceInvoiceWorkingAt: { lt: leaseExpiredAt } }],
		},
		select: { id: true },
		orderBy: { spaceInvoiceNextTryAt: "asc" },
		take: 10,
	});

	for (const order of orders) {
		await processInvoiceJob(order.id, dependencies, now);
	}
}

const globalWorker = globalThis as typeof globalThis & {
	invoiceWorkerTimer?: ReturnType<typeof setInterval>;
};

export function startInvoiceWorker(): void {
	if (globalWorker.invoiceWorkerTimer) return;

	const run = () => {
		void runInvoiceWorkerTick().catch((error) => {
			console.error("[invoice-worker] Tick failed", error);
		});
	};

	run();
	globalWorker.invoiceWorkerTimer = setInterval(run, POLL_INTERVAL_MS);
	globalWorker.invoiceWorkerTimer.unref?.();
}

export async function enqueueOrderInvoice(orderId: string): Promise<void> {
	await db.order.updateMany({
		where: { id: orderId, status: "completed", spaceInvoiceSentAt: null },
		data: { spaceInvoiceNextTryAt: new Date(), spaceInvoiceError: null },
	});
}
