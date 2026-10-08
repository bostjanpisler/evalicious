import { describe, expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { BACKUP_TABLES, backupKeyFor, buildBackup, type BackupSource, keysToPrune } from "./backup";

describe("backup keys", () => {
	test("one key per UTC day", () => {
		expect(backupKeyFor(new Date("2026-10-08T23:59:59Z"))).toBe("backups/2026-10-08.json.gz");
	});

	test("prunes only dated backups older than the retention window", () => {
		const now = new Date("2026-10-08T12:00:00Z");
		const keys = [
			"backups/2026-08-01.json.gz",
			"backups/2026-09-07.json.gz",
			"backups/2026-09-08.json.gz",
			"backups/2026-09-09.json.gz",
			"backups/2026-10-08.json.gz",
			"backups/notes.txt",
			"ebooks/x.pdf",
		];
		expect(keysToPrune(keys, now, 30)).toEqual([
			"backups/2026-08-01.json.gz",
			"backups/2026-09-07.json.gz",
		]);
	});
});

describe("buildBackup", () => {
	test("exports every table to a readable gzipped JSON with counts", async () => {
		const source = Object.fromEntries(
			BACKUP_TABLES.map((name, i) => [
				name,
				{
					findMany: async () =>
						Array.from({ length: i }, (_, n) => ({
							id: `${name}-${n}`,
							createdAt: new Date("2026-01-01T00:00:00Z"),
						})),
				},
			]),
		) as unknown as BackupSource;
		const { body, counts } = await buildBackup(source, new Date("2026-10-08T00:00:00Z"));
		const parsed = JSON.parse(gunzipSync(Buffer.from(body)).toString());
		expect(parsed.createdAt).toBe("2026-10-08T00:00:00.000Z");
		expect(Object.keys(parsed.tables)).toEqual([...BACKUP_TABLES]);
		expect(parsed.tables.order).toHaveLength(BACKUP_TABLES.indexOf("order"));
		expect(parsed.tables.order[0]?.createdAt).toBe("2026-01-01T00:00:00.000Z");
		expect(counts.user).toBe(0);
		expect(counts.freeDownloadLead).toBe(BACKUP_TABLES.length - 1);
	});

	test("never includes sessions or one-time tokens", () => {
		expect(BACKUP_TABLES).not.toContain("session" as never);
		expect(BACKUP_TABLES).not.toContain("verification" as never);
	});
});
