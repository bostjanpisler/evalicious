import { db } from "./db.js";
import { reportError } from "./monitoring.js";
import { deleteStoredKey, listStoredKeys, storeObject } from "./r2.js";
import {
	BACKUP_PREFIX,
	backupKeyFor,
	buildBackup,
	type BackupSource,
	keysToPrune,
} from "./backup.js";

const CHECK_EVERY_MS = 6 * 60 * 60_000;
const FIRST_CHECK_DELAY_MS = 2 * 60_000;

export async function runBackup(
	now = new Date(),
): Promise<{ key: string; counts: Record<string, number> } | null> {
	const key = backupKeyFor(now);
	const existing = await listStoredKeys(BACKUP_PREFIX);
	if (existing.includes(key)) return null;

	const { body, counts } = await buildBackup(db as unknown as BackupSource, now);
	await storeObject(key, body, "application/gzip");

	for (const old of keysToPrune([...existing, key], now)) await deleteStoredKey(old);
	return { key, counts };
}

/** Writes today's backup once a day (checked every few hours, so a restart never skips a day). */
export function startBackupWorker() {
	if (!process.env.STORAGE_BUCKET || !process.env.STORAGE_ENDPOINT) return;
	const tick = () =>
		runBackup()
			.then((result) => {
				if (result) console.log(`[backup] wrote ${result.key}`, result.counts);
			})
			.catch((error) => reportError(error, { source: "backup" }));
	setTimeout(tick, FIRST_CHECK_DELAY_MS).unref?.();
	setInterval(tick, CHECK_EVERY_MS).unref?.();
}
