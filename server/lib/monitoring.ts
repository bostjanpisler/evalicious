import * as Sentry from "@sentry/bun";
import { createAlertThrottle } from "./alert-throttle.js";
import { sendAlertEmail } from "./email.js";

// Error reporting. Everything is optional and does nothing until configured:
//   SENTRY_DSN   send errors to Sentry
//   ALERT_EMAIL  email a short alert (throttled) when a page or API call fails with a 5xx
// Errors are always logged.
const shouldAlert = createAlertThrottle({ windowMs: 60 * 60_000, maxPerWindow: 10 });
let sentryReady = false;

export function initMonitoring() {
	const dsn = process.env.SENTRY_DSN?.trim();
	if (!dsn || sentryReady) return;
	Sentry.init({
		dsn,
		environment: process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV ?? "production",
		release: process.env.RAILWAY_GIT_COMMIT_SHA,
		tracesSampleRate: 0,
	});
	sentryReady = true;
}

export type ErrorContext = { path?: string; source?: string; status?: number };

export function reportError(error: unknown, context: ErrorContext = {}) {
	const err = error instanceof Error ? error : new Error(String(error));
	console.error(`[error] ${context.source ?? "server"} ${context.path ?? ""}`, err);

	if (sentryReady) {
		Sentry.captureException(err, { extra: { ...context } });
	}

	const to = process.env.ALERT_EMAIL?.trim();
	if (to && shouldAlert(`${err.name}:${err.message}:${context.path ?? ""}`)) {
		void sendAlertEmail(to, {
			subject: `Eva-licious error: ${err.message}`.slice(0, 120),
			body: [
				`${err.name}: ${err.message}`,
				context.path ? `Path: ${context.path}` : "",
				context.status ? `Status: ${context.status}` : "",
				context.source ? `Source: ${context.source}` : "",
				"",
				(err.stack ?? "").split("\n").slice(0, 12).join("\n"),
			]
				.filter((line) => line !== "")
				.join("\n"),
		}).catch(() => undefined);
	}
}
