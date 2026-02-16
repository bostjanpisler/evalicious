"use client";

import { useEffect } from "react";

export function ChatWidget() {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://api.chatwithhal.com/widget.js";
		script.setAttribute("data-app-id", "cmlp2rrfz000i2pnte8wb3e94");
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return null;
}
