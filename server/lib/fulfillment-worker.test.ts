import { describe, expect, mock, test } from "bun:test";
import { fulfillmentRetryDelayMs, processFulfillmentJob } from "./fulfillment-worker";

function dependencies(claimResult: { attempts: number } | null = { attempts: 1 }) {
	const now = new Date("2026-07-14T10:00:00Z");
	return {
		claim: mock(async () => claimResult),
		fulfill: mock(async () => {}),
		markCompleted: mock(async () => {}),
		markFailed: mock(async () => {}),
		now: mock(() => now),
	};
}

describe("fulfillment worker", () => {
	test("completes a claimed fulfillment", async () => {
		const deps = dependencies();
		expect(await processFulfillmentJob("order_1", deps)).toBe("completed");
		expect(deps.markCompleted).toHaveBeenCalledWith("order_1");
	});

	test("schedules exponential retry after failure", async () => {
		const deps = dependencies();
		deps.claim = mock(async () => ({ attempts: 3 }));
		deps.fulfill = mock(async () => {
			throw new Error("R2 unavailable");
		});
		expect(await processFulfillmentJob("order_2", deps)).toBe("retry");
		expect(deps.markFailed).toHaveBeenCalledWith(
			"order_2",
			"R2 unavailable",
			new Date(deps.now().getTime() + 120_000),
		);
	});

	test("skips work held by another process", async () => {
		const deps = dependencies(null);
		expect(await processFulfillmentJob("order_3", deps)).toBe("skipped");
		expect(deps.fulfill).not.toHaveBeenCalled();
	});

	test("caps retries at six hours", () => {
		expect(fulfillmentRetryDelayMs(20)).toBe(6 * 60 * 60_000);
	});
});
