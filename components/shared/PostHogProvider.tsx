"use client";

import { useEffect, useRef } from "react";
import { initializeAnalytics } from "@/lib/analytics-client";
import { useCookieConsent } from "./CookieConsent";

export function PostHogProvider() {
	const consent = useCookieConsent();
	const initialized = useRef(false);

	useEffect(() => {
		if (consent !== true || initialized.current) return;

		let cancelled = false;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;
		const initialize = () => {
			initialized.current = true;
			void initializeAnalytics().catch(() => {
				initialized.current = false;
				if (!cancelled) retryTimer = setTimeout(initialize, 5_000);
			});
		};

		initialize();
		return () => {
			cancelled = true;
			if (retryTimer) clearTimeout(retryTimer);
		};
	}, [consent]);

	return null;
}
