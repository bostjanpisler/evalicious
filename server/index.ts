import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { renderPage } from "vike/server";
import { db } from "./lib/db.js";
import { startFulfillmentWorker } from "./lib/fulfillment-worker.js";
import { startInvoiceWorker } from "./lib/invoice-worker.js";
import { allowedOrigins } from "./lib/origins.js";
import { authHandler } from "./routes/api.auth.js";
import { downloadHandler } from "./routes/api.download.js";
import { favoritesHandler } from "./routes/api.favorites.js";
import { listsHandler } from "./routes/api.lists.js";
import { progressHandler } from "./routes/api.progress.js";
import { stripeHandler } from "./routes/api.stripe.js";

const isProduction = process.env.NODE_ENV === "production";

const app = new Hono();

startInvoiceWorker();
startFulfillmentWorker();

app.use("*", logger());
app.use(
	"*",
	secureHeaders({
		contentSecurityPolicy: {
			defaultSrc: ["'self'"],
			baseUri: ["'self'"],
			connectSrc: [
				"'self'",
				"https://eu.i.posthog.com",
				"https://*.posthog.com",
				"https://*.chatwithhal.com",
				"wss://*.chatwithhal.com",
			],
			fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
			formAction: ["'self'", "https://checkout.stripe.com"],
			frameAncestors: ["'self'"],
			frameSrc: [
				"'self'",
				"https://www.youtube.com",
				"https://www.youtube-nocookie.com",
				"https://iframe.mediadelivery.net",
				"https://*.chatwithhal.com",
			],
			imgSrc: [
				"'self'",
				"data:",
				"blob:",
				"https://cdn.sanity.io",
				"https://*.posthog.com",
				"https://*.chatwithhal.com",
			],
			mediaSrc: ["'self'", "blob:", "https://*.b-cdn.net"],
			objectSrc: ["'none'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "https://*.chatwithhal.com"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			workerSrc: ["'self'", "blob:"],
		},
		crossOriginEmbedderPolicy: false,
		crossOriginOpenerPolicy: "same-origin-allow-popups",
		crossOriginResourcePolicy: "same-origin",
		permissionsPolicy: {
			camera: [],
			geolocation: [],
			microphone: [],
			payment: ["self"],
		},
		referrerPolicy: "strict-origin-when-cross-origin",
		strictTransportSecurity: "max-age=31536000; includeSubDomains",
		xContentTypeOptions: "nosniff",
		xFrameOptions: "SAMEORIGIN",
	}),
);
app.use(
	"/api/*",
	cors({
		origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
		credentials: true,
	}),
);

app.get("/health", async (c) => {
	c.header("Cache-Control", "no-store");
	try {
		await db.$queryRaw`SELECT 1`;
		return c.json({ status: "ok" });
	} catch {
		return c.json({ status: "unavailable" }, 503);
	}
});

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
		const res = await fetch(`https://www.instagram.com/p/${shortcode}/media/?size=m`, {
			redirect: "follow",
		});
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
