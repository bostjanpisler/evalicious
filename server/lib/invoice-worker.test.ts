import { describe, expect, mock, test } from "bun:test";
import { invoiceRetryDelayMs, processInvoiceJob } from "./invoice-worker";

function createDependencies() {
	const now = new Date("2026-07-13T12:00:00Z");
	return {
		claim: mock(async () => ({ attempts: 1 })),
		issue: mock(async () => {}),
		markSent: mock(async () => {}),
		markFailed: mock(async () => {}),
		now: mock(() => now),
	};
}

describe("invoice worker", () => {
	test("marks a claimed invoice as sent", async () => {
		const dependencies = createDependencies();
		const result = await processInvoiceJob(
			"order_1",
			dependencies,
			new Date("2026-07-13T12:00:00Z"),
		);

		expect(result).toBe("sent");
		expect(dependencies.issue).toHaveBeenCalledWith("order_1");
		expect(dependencies.markSent).toHaveBeenCalledWith("order_1");
		expect(dependencies.markFailed).not.toHaveBeenCalled();
	});

	test("schedules a retry after an issuance failure", async () => {
		const dependencies = createDependencies();
		dependencies.claim = mock(async () => ({ attempts: 3 }));
		dependencies.issue = mock(async () => {
			throw new Error("Space unavailable");
		});
		const now = new Date("2026-07-13T12:00:00Z");

		const result = await processInvoiceJob("order_2", dependencies, now);

		expect(result).toBe("retry");
		expect(dependencies.markFailed).toHaveBeenCalledWith(
			"order_2",
			"Space unavailable",
			new Date(now.getTime() + 120_000),
		);
	});

	test("does nothing when another worker owns the lease", async () => {
		const dependencies = {
			...createDependencies(),
			claim: mock(async () => null),
		};

		expect(await processInvoiceJob("order_3", dependencies)).toBe("skipped");
		expect(dependencies.issue).not.toHaveBeenCalled();
	});

	test("caps retry delays at six hours", () => {
		expect(invoiceRetryDelayMs(20)).toBe(6 * 60 * 60_000);
	});
});
