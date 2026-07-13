"use client";

import { useEffect, useRef } from "react";
import { initializeAnalytics } from "@/lib/analytics-client";
import { useCookieConsent } from "./CookieConsent";

export function PostHogProvider() {
	const consent = useCookieConsent();
	const initialized = useRef(false);

	useEffect(() => {
		if (consent !== true || initialized.current) return;

		initialized.current = true;
		void initializeAnalytics().catch(() => {
			initialized.current = false;
		});
	}, [consent]);

	return null;
}
