"use client";

import { useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";

declare global {
	interface Window {
		turnstile?: {
			render: (el: HTMLElement, options: Record<string, unknown>) => string;
			reset: (id?: string) => void;
			remove: (id?: string) => void;
		};
	}
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
	if (window.turnstile) return Promise.resolve();
	scriptPromise ??= new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = SCRIPT_SRC;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => {
			scriptPromise = null;
			reject(new Error("Turnstile failed to load"));
		};
		document.head.appendChild(script);
	});
	return scriptPromise;
}

/**
 * Cloudflare Turnstile bot check. Renders nothing (and `onToken` is never called) when
 * no site key is configured, so forms keep working without it. The widget stays hidden
 * unless Cloudflare needs the visitor to interact.
 */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
	const siteKey = usePageContext().turnstileSiteKey;
	const container = useRef<HTMLDivElement>(null);
	const onTokenRef = useRef(onToken);
	onTokenRef.current = onToken;

	useEffect(() => {
		if (!siteKey || !container.current) return;
		let widgetId: string | undefined;
		let cancelled = false;
		loadScript()
			.then(() => {
				if (cancelled || !container.current || !window.turnstile) return;
				widgetId = window.turnstile.render(container.current, {
					sitekey: siteKey,
					appearance: "interaction-only",
					callback: (token: string) => onTokenRef.current(token),
					"expired-callback": () => onTokenRef.current(null),
					"error-callback": () => onTokenRef.current(null),
				});
			})
			.catch(() => onTokenRef.current(null));
		return () => {
			cancelled = true;
			if (widgetId) window.turnstile?.remove(widgetId);
		};
	}, [siteKey]);

	if (!siteKey) return null;
	return <div ref={container} />;
}
