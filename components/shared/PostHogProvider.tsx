"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { useCookieConsent } from "./CookieConsent";

const POSTHOG_KEY = "phc_awaGW187SGSK3L3106KapGxTBGUGLCufv2yBg9znVyN";
const POSTHOG_HOST = "https://eu.i.posthog.com";

export function PostHogProvider() {
	const consent = useCookieConsent();

	useEffect(() => {
		if (consent !== true) return;

		posthog.init(POSTHOG_KEY, {
			api_host: POSTHOG_HOST,
			capture_pageview: true,
			capture_pageleave: true,
			persistence: "localStorage+cookie",
		});

		return () => {
			posthog.reset();
		};
	}, [consent]);

	return null;
}
