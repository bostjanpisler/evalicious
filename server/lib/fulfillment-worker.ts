import { db } from "./db.js";
import { fulfillOrder } from "./order-fulfillment.js";

const POLL_INTERVAL_MS = 30_000;
const LEASE_DURATION_MS = 5 * 60_000;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60_000;

export interface FulfillmentWorkerDependencies {
	claim(orderId: string, now: Date, leaseExpiredAt: Date): Promise<{ attempts: number } | null>;
	fulfill(orderId: string): Promise<void>;
	markCompleted(orderId: string): Promise<void>;
	markFailed(orderId: string, error: string, nextTryAt: Date): Promise<void>;
	now(): Date;
}

const dependencies: FulfillmentWorkerDependencies = {
	async claim(orderId, now, leaseExpiredAt) {
		const result = await db.order.updateMany({
			where: {
				id: orderId,
				status: "completed",
				fulfillmentCompletedAt: null,
				fulfillmentNextTryAt: { lte: now },
				OR: [{ fulfillmentWorkingAt: null }, { fulfillmentWorkingAt: { lt: leaseExpiredAt } }],
			},
			data: { fulfillmentWorkingAt: now, fulfillmentAttempts: { increment: 1 } },
		});
		if (result.count === 0) return null;
		const order = await db.order.findUniqueOrThrow({
			where: { id: orderId },
			select: { fulfillmentAttempts: true },
		});
		return { attempts: order.fulfillmentAttempts };
	},
	fulfill: (orderId) => fulfillOrder(orderId, true),
	async markCompleted(orderId) {
		await db.order.update({
			where: { id: orderId },
			data: { fulfillmentWorkingAt: null, fulfillmentNextTryAt: null, fulfillmentError: null },
		});
	},
	async markFailed(orderId, error, nextTryAt) {
		await db.order.update({
			where: { id: orderId },
			data: {
				fulfillmentWorkingAt: null,
				fulfillmentNextTryAt: nextTryAt,
				fulfillmentError: error.slice(0, 1000),
			},
		});
	},
	now: () => new Date(),
};

export function fulfillmentRetryDelayMs(attempts: number): number {
	return Math.min(30_000 * 2 ** Math.max(0, attempts - 1), MAX_RETRY_DELAY_MS);
}

export async function processFulfillmentJob(
	orderId: string,
	deps: FulfillmentWorkerDependencies = dependencies,
	now = new Date(),
): Promise<"skipped" | "completed" | "retry"> {
	const claim = await deps.claim(orderId, now, new Date(now.getTime() - LEASE_DURATION_MS));
	if (!claim) return "skipped";
	try {
		await deps.fulfill(orderId);
		await deps.markCompleted(orderId);
		return "completed";
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown fulfillment error";
		const nextTryAt = new Date(deps.now().getTime() + fulfillmentRetryDelayMs(claim.attempts));
		await deps.markFailed(orderId, message, nextTryAt);
		return "retry";
	}
}

export async function runFulfillmentWorkerTick(): Promise<void> {
	const now = new Date();
	const leaseExpiredAt = new Date(now.getTime() - LEASE_DURATION_MS);
	const orders = await db.order.findMany({
		where: {
			status: "completed",
			fulfillmentCompletedAt: null,
			fulfillmentNextTryAt: { lte: now },
			OR: [{ fulfillmentWorkingAt: null }, { fulfillmentWorkingAt: { lt: leaseExpiredAt } }],
		},
		select: { id: true },
		orderBy: { fulfillmentNextTryAt: "asc" },
		take: 10,
	});
	for (const order of orders) await processFulfillmentJob(order.id, dependencies, now);
}

const globalWorker = globalThis as typeof globalThis & {
	fulfillmentWorkerTimer?: ReturnType<typeof setInterval>;
};

export function startFulfillmentWorker(): void {
	if (globalWorker.fulfillmentWorkerTimer) return;
	const run = () => {
		void runFulfillmentWorkerTick().catch((error) => {
			console.error("[fulfillment-worker] Tick failed", error);
		});
	};
	run();
	globalWorker.fulfillmentWorkerTimer = setInterval(run, POLL_INTERVAL_MS);
	globalWorker.fulfillmentWorkerTimer.unref?.();
}

export async function enqueueOrderFulfillment(orderId: string): Promise<void> {
	await db.order.updateMany({
		where: { id: orderId, status: "completed", fulfillmentCompletedAt: null },
		data: { fulfillmentNextTryAt: new Date(), fulfillmentError: null },
	});
}
