const windows = new Map<string, { count: number; resetsAt: number }>();

/** Fixed-window counter per key. Returns true when the call is over the limit. */
export function isRateLimited(
	key: string,
	limit = 10,
	windowMs = 60_000,
	now = Date.now(),
): boolean {
	if (windows.size > 10_000) {
		for (const [entryKey, entry] of windows) {
			if (entry.resetsAt <= now) windows.delete(entryKey);
		}
	}
	const current = windows.get(key);
	if (!current || current.resetsAt <= now) {
		windows.set(key, { count: 1, resetsAt: now + windowMs });
		return false;
	}
	current.count += 1;
	return current.count > limit;
}

// Railway's edge sets X-Real-IP; the left-most X-Forwarded-For entry is client-controlled.
export function clientIp(headers: Headers): string | null {
	return (
		headers.get("x-real-ip")?.trim() ||
		headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
		null
	);
}
