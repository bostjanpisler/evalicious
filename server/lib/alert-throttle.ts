/**
 * Lets an error alert through at most once per `windowMs` for the same key, and at
 * most `maxPerWindow` alerts overall, so a failing page can't flood an inbox.
 */
export function createAlertThrottle(options: { windowMs: number; maxPerWindow: number }) {
	const lastSent = new Map<string, number>();
	let windowStart = 0;
	let sentInWindow = 0;

	return function shouldAlert(key: string, now = Date.now()): boolean {
		if (now - windowStart >= options.windowMs) {
			windowStart = now;
			sentInWindow = 0;
		}
		const previous = lastSent.get(key);
		if (previous !== undefined && now - previous < options.windowMs) return false;
		if (sentInWindow >= options.maxPerWindow) return false;
		lastSent.set(key, now);
		sentInWindow += 1;
		if (lastSent.size > 500) {
			for (const [k, at] of lastSent) if (now - at >= options.windowMs) lastSent.delete(k);
		}
		return true;
	};
}
