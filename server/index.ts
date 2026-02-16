import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { renderPage } from "vike/server";
import { authHandler } from "./routes/api.auth.js";
import { stripeHandler } from "./routes/api.stripe.js";
import { favoritesHandler } from "./routes/api.favorites.js";
import { listsHandler } from "./routes/api.lists.js";
import { progressHandler } from "./routes/api.progress.js";
import { downloadHandler } from "./routes/api.download.js";

const isProduction = process.env.NODE_ENV === "production";

const app = new Hono();

app.use("*", logger());
const allowedOrigins = [
	process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	"http://localhost:3000",
	"http://localhost:3100",
];
app.use(
	"/api/*",
	cors({
		origin: (origin) => allowedOrigins.includes(origin) ? origin : null,
		credentials: true,
	}),
);

// API routes
app.route("/api/auth", authHandler);
app.route("/api/stripe", stripeHandler);
app.route("/api/favorites", favoritesHandler);
app.route("/api/lists", listsHandler);
app.route("/api/progress", progressHandler);
app.route("/api/download", downloadHandler);

// Instagram thumbnail proxy (avoids CORS)
app.get("/api/ig/:shortcode", async (c) => {
	const { shortcode } = c.req.param();
	if (!/^[\w-]{6,20}$/.test(shortcode)) {
		return c.text("Invalid shortcode", 400);
	}
	try {
		const res = await fetch(
			`https://www.instagram.com/p/${shortcode}/media/?size=m`,
			{ redirect: "follow" },
		);
		if (!res.ok) return c.text("Not found", 404);
		const contentType = res.headers.get("content-type") ?? "image/jpeg";
		const body = await res.arrayBuffer();
		return new Response(body, {
			headers: {
				"content-type": contentType,
				"cache-control": "public, max-age=86400",
			},
		});
	} catch {
		return c.text("Fetch failed", 502);
	}
});

if (isProduction) {
	const { serveStatic } = await import("@hono/node-server/serve-static");
	app.use("/*", serveStatic({ root: "./dist/client/" }));
}

// Vike SSR handler
app.all("*", async (c, next) => {
	const pageContext = await renderPage({
		urlOriginal: c.req.url,
		headersOriginal: c.req.raw.headers,
	});
	const { httpResponse } = pageContext;

	if (!httpResponse) {
		return next();
	}

	const { statusCode, headers } = httpResponse;
	const responseHeaders = new Headers();
	for (const [name, value] of headers) {
		responseHeaders.set(name, value);
	}

	const readable = httpResponse.getReadableWebStream();
	return new Response(readable, {
		status: statusCode,
		headers: responseHeaders,
	});
});

export default app;
