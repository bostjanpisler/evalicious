// Production smoke test.
//   bun scripts/smoke.ts                 critical pages only (every 30 minutes in CI)
//   bun scripts/smoke.ts --full          every URL in the sitemap (daily in CI)
//   bun scripts/smoke.ts --base http://localhost:3100
// Exits non-zero when anything is not a healthy 200, so CI sends a failure email.

const CRITICAL = [
	"/health",
	"/",
	"/en",
	"/recipes",
	"/en/recipes",
	"/travel",
	"/shop",
	"/courses",
	"/about",
	"/privacy",
	"/login",
	"/sitemap.xml",
];

export function urlsFromSitemap(xml: string, base: string): string[] {
	const origin = new URL(base).origin;
	const paths: string[] = [];
	for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
		try {
			const url = new URL(match[1] ?? "");
			if (url.origin === origin) paths.push(`${url.pathname}${url.search}`);
		} catch {
			// not a URL: skip
		}
	}
	return paths;
}

export function looksHealthy(path: string, status: number, body: string): string | null {
	if (status !== 200) return `HTTP ${status}`;
	if (path === "/health") return body.includes('"ok"') ? null : "health not ok";
	if (path.endsWith(".xml")) return body.startsWith("<?xml") ? null : "not XML";
	if (!body.includes("</html>")) return "truncated HTML";
	if (/Internal Server Error/i.test(body.slice(0, 5000))) return "error page";
	return null;
}

async function check(base: string, path: string): Promise<string | null> {
	let last = "";
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const response = await fetch(new URL(path, base), {
				signal: AbortSignal.timeout(25_000),
				headers: { "User-Agent": "eva-licious-smoke/1.0" },
			});
			const problem = looksHealthy(path, response.status, await response.text());
			if (!problem) return null;
			last = problem;
		} catch (error) {
			last = error instanceof Error ? error.message : String(error);
		}
		await new Promise((resolve) => setTimeout(resolve, 3_000));
	}
	return last;
}

async function main() {
	const args = process.argv.slice(2);
	const base = args.includes("--base")
		? (args[args.indexOf("--base") + 1] ?? "")
		: "https://eva-licious.com";
	const full = args.includes("--full");
	let paths = CRITICAL;
	if (full) {
		const sitemap = await fetch(new URL("/sitemap.xml", base)).then((r) => r.text());
		paths = [...new Set([...CRITICAL, ...urlsFromSitemap(sitemap, base)])];
	}

	const failures: string[] = [];
	let next = 0;
	await Promise.all(
		Array.from({ length: 6 }, async () => {
			while (next < paths.length) {
				const path = paths[next++] as string;
				const problem = await check(base, path);
				if (problem) failures.push(`${path}: ${problem}`);
			}
		}),
	);

	console.log(`${paths.length} URLs checked on ${base}, ${failures.length} failed`);
	for (const failure of failures.sort()) console.log(`  FAIL ${failure}`);
	if (failures.length) process.exit(1);
}

if (import.meta.main) await main();
