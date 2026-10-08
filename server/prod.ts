import { serve } from "@hono/node-server";
import app from "./index.js";
import { reportError } from "./lib/monitoring.js";

process.on("unhandledRejection", (reason) => reportError(reason, { source: "unhandledRejection" }));
process.on("uncaughtException", (error) => reportError(error, { source: "uncaughtException" }));

const migration = Bun.spawn(["bunx", "prisma", "migrate", "deploy"], {
	env: process.env,
	stderr: "inherit",
	stdout: "inherit",
});
const migrationExitCode = await migration.exited;

if (migrationExitCode !== 0) {
	console.error(`Database migration failed with exit code ${migrationExitCode}`);
	process.exit(migrationExitCode);
}

const port = Number(process.env.PORT ?? 3000);
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });
