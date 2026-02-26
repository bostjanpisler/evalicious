"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useCookieConsent } from "./CookieConsent";

const POSTHOG_KEY = "phc_awaGW187SGSK3L3106KapGxTBGUGLCufv2yBg9znVyN";
const POSTHOG_HOST = "https://eu.i.posthog.com";

export function PostHogProvider() {
	const consent = useCookieConsent();
	const initialized = useRef(false);

	useEffect(() => {
		if (consent !== true || initialized.current) return;

		posthog.init(POSTHOG_KEY, {
			api_host: POSTHOG_HOST,
			capture_pageview: true,
			capture_pageleave: true,
			persistence: "localStorage+cookie",
			person_profiles: "identified_only",
		});

		initialized.current = true;
	}, [consent]);

	return null;
}
