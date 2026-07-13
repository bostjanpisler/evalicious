type AnalyticsClient = typeof import("posthog-js")["default"];

let client: AnalyticsClient | null = null;
let initialization: Promise<void> | null = null;

export function initializeAnalytics(): Promise<void> {
	if (initialization) return initialization;

	initialization = import("posthog-js")
		.then(({ default: posthog }) => {
			posthog.init("phc_awaGW187SGSK3L3106KapGxTBGUGLCufv2yBg9znVyN", {
				api_host: "https://eu.i.posthog.com",
				capture_pageview: true,
				capture_pageleave: true,
				persistence: "localStorage+cookie",
				person_profiles: "identified_only",
			});
			client = posthog;
		})
		.catch((error) => {
			initialization = null;
			throw error;
		});

	return initialization;
}

export function capture(event: string, properties?: Record<string, unknown>) {
	client?.capture(event, properties);
}
