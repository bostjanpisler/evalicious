/**
 * Startup migration script using pg directly.
 * Logs to stderr so output is visible in Railway logs ([err] stream).
 */
import pkg from "pg";
import { readFileSync } from "fs";

const { Pool } = pkg as typeof import("pg");
const log = (msg: string) => process.stderr.write(`[setup-db] ${msg}\n`);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
log(`Connecting to database...`);

for (let attempt = 1; attempt <= 30; attempt++) {
	let client: import("pg").PoolClient | null = null;
	try {
		client = await pool.connect();
		log("Connected.");

		const { rows } = await client.query(
			"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') AS exists",
		);
		const exists = rows[0]?.exists === true || rows[0]?.exists === "t" || rows[0]?.exists === "true";
		log(`Table exists: ${exists}`);

		if (!exists) {
			log("Tables not found. Running migration...");
			const sql = readFileSync("prisma/migrations/20260219000000_init/migration.sql", "utf8");
			await client.query(sql);
			log("Migration complete.");
		} else {
			log("Tables already exist. Skipping migration.");
		}

		client.release();
		await pool.end();
		log("Done.");
		process.exit(0);
	} catch (err: unknown) {
		if (client) client.release();
		const msg = err instanceof Error ? err.message : String(err);
		log(`Attempt ${attempt}/30 failed: ${msg}`);
		if (attempt >= 30) {
			log("Giving up. Exiting.");
			process.exit(1);
		}
		await Bun.sleep(3000);
	}
}
