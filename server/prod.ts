import { serve } from "@hono/node-server";
import pkg from "pg";
import { readFileSync } from "fs";
import app from "./index.js";

// Run migration before accepting requests
const log = (msg: string) => process.stderr.write(`[migration] ${msg}\n`);
const { Pool } = pkg as typeof import("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

log("Starting database migration check...");
for (let attempt = 1; attempt <= 30; attempt++) {
	let client: import("pg").PoolClient | null = null;
	try {
		client = await pool.connect();
		const { rows } = await client.query(
			"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') AS exists",
		);
		const exists = rows[0]?.exists === true || rows[0]?.exists === "t" || rows[0]?.exists === "true";
		log(`Table check: exists=${exists}`);
		if (!exists) {
			log("Running initial migration...");
			const sql = readFileSync("prisma/migrations/20260219000000_init/migration.sql", "utf8");
			await client.query(sql);
			log("Migration complete.");
		} else {
			log("Tables already exist, skipping.");
		}
		client.release();
		await pool.end();
		break;
	} catch (err: unknown) {
		if (client) client.release();
		const msg = err instanceof Error ? err.message : String(err);
		log(`Attempt ${attempt}/30 failed: ${msg}`);
		if (attempt >= 30) {
			log("Could not initialize database. Exiting.");
			process.exit(1);
		}
		await Bun.sleep(3000);
	}
}

const port = Number(process.env.PORT ?? 3000);
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });
