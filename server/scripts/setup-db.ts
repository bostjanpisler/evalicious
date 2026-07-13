const migration = Bun.spawn(["bunx", "prisma", "migrate", "deploy"], {
	stdout: "inherit",
	stderr: "inherit",
});

const exitCode = await migration.exited;
if (exitCode !== 0) {
	process.exit(exitCode);
}
