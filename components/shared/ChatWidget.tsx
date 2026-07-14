"use client";

import { useEffect } from "react";
import { useCookieConsent } from "./CookieConsent";

export function ChatWidget() {
	const consent = useCookieConsent();

	useEffect(() => {
		if (consent !== true) return;
		if (document.querySelector('script[data-evalicious-chat="true"]')) return;
		const script = document.createElement("script");
		script.src = "https://api.chatwithhal.com/widget.js";
		script.setAttribute("data-app-id", "cmlp2rrfz000i2pnte8wb3e94");
		script.setAttribute("data-evalicious-chat", "true");
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		return () => {
			script.remove();
		};
	}, [consent]);

	return null;
}
