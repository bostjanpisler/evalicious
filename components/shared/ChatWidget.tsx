"use client";

import { useEffect } from "react";

export function ChatWidget() {
	useEffect(() => {
		// Load chatwithhal.com embed script
		const script = document.createElement("script");
		script.src = "https://chatwithhal.com/embed.js";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return <div id="chatwithhal-widget" />;
}
