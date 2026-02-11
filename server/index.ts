import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { renderPage } from "vike/server";
import { authHandler } from "./routes/api.auth.js";
import { stripeHandler } from "./routes/api.stripe.js";
import { favoritesHandler } from "./routes/api.favorites.js";
import { listsHandler } from "./routes/api.lists.js";
import { progressHandler } from "./routes/api.progress.js";

const isProduction = process.env.NODE_ENV === "production";

const app = new Hono();

app.use("*", logger());
app.use(
	"/api/*",
	cors({
		origin: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
		credentials: true,
	}),
);

// API routes
app.route("/api/auth", authHandler);
app.route("/api/stripe", stripeHandler);
app.route("/api/favorites", favoritesHandler);
app.route("/api/lists", listsHandler);
app.route("/api/progress", progressHandler);

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

if (isProduction) {
	const { serve } = await import("@hono/node-server");
	const port = Number(process.env.PORT ?? 3000);
	console.log(`Server running at http://localhost:${port}`);
	serve({ fetch: app.fetch, port });
}

export default app;
