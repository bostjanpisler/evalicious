import { gzipSync } from "node:zlib";

// Nightly export of everything that cannot be re-created from Sanity or Stripe:
// users, orders, course access/progress, favourites, lists and consent records.
// It is a logical (JSON) backup stored in the private file bucket, as a safety
// net independent of the database volume. Sessions and one-time tokens are left out.

export const BACKUP_PREFIX = "backups/";
export const BACKUP_KEEP_DAYS = 30;

export const BACKUP_TABLES = [
	"user",
	"account",
	"product",
	"order",
	"orderItem",
	"courseAccess",
	"lessonProgress",
	"userFavorite",
	"userList",
	"userListItem",
	"freeDownloadLead",
] as const;

export function backupKeyFor(date: Date): string {
	return `${BACKUP_PREFIX}${date.toISOString().slice(0, 10)}.json.gz`;
}

/** Keys older than `keepDays` (by the date in their name); anything unrecognised is kept. */
export function keysToPrune(keys: string[], now: Date, keepDays = BACKUP_KEEP_DAYS): string[] {
	const cutoff = new Date(now);
	cutoff.setUTCDate(cutoff.getUTCDate() - keepDays);
	const cutoffKey = backupKeyFor(cutoff);
	return keys.filter(
		(key) => /^backups\/\d{4}-\d{2}-\d{2}\.json\.gz$/.test(key) && key < cutoffKey,
	);
}

type Delegate = { findMany: () => Promise<unknown[]> };
export type BackupSource = Record<(typeof BACKUP_TABLES)[number], Delegate>;

export async function buildBackup(source: BackupSource, now = new Date()) {
	const tables: Record<string, unknown[]> = {};
	for (const table of BACKUP_TABLES) tables[table] = await source[table].findMany();
	const counts = Object.fromEntries(
		Object.entries(tables).map(([name, rows]) => [name, rows.length]),
	);
	const json = JSON.stringify({ createdAt: now.toISOString(), counts, tables });
	return { body: new Uint8Array(gzipSync(Buffer.from(json))), counts };
}
