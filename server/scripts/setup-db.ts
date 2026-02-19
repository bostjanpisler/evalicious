/**
 * Startup migration script.
 * Uses the existing Prisma client (which already has DATABASE_URL configured)
 * to check if tables exist and run the initial migration SQL if needed.
 * Retries until the database is ready.
 */
import { db } from "../lib/db";
import { readFileSync } from "fs";

const MIGRATION_SQL = "prisma/migrations/20260219000000_init/migration.sql";
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 3000;

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
	try {
		const result = await db.$queryRaw<[{ exists: boolean }]>`
			SELECT EXISTS (
				SELECT FROM pg_tables
				WHERE schemaname = 'public' AND tablename = 'User'
			)
		`;

		if (!result[0].exists) {
			console.log("Tables not found, running initial migration...");
			const sql = readFileSync(MIGRATION_SQL, "utf8");
			// Run each statement individually to avoid multi-statement issues
			const statements = sql
				.split(/;\s*\n/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0 && !s.startsWith("--") && !s.startsWith("/*"));
			for (const stmt of statements) {
				if (stmt) await db.$executeRawUnsafe(stmt);
			}
			console.log("Migration complete.");
		} else {
			console.log("Database already initialized.");
		}

		await db.$disconnect();
		process.exit(0);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.log(`DB setup attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`);
		if (attempt >= MAX_RETRIES) {
			console.error("Could not initialize database. Aborting.");
			process.exit(1);
		}
		await Bun.sleep(RETRY_DELAY_MS);
	}
}
