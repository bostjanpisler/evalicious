"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie-consent";

export function useCookieConsent() {
	const [consent, setConsent] = useState<boolean | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(CONSENT_KEY);
		if (stored === "granted") setConsent(true);
		else if (stored === "denied") setConsent(false);
	}, []);

	return consent;
}

export function CookieConsent() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(CONSENT_KEY);
		if (!stored) setVisible(true);
	}, []);

	function accept() {
		localStorage.setItem(CONSENT_KEY, "granted");
		setVisible(false);
		window.location.reload();
	}

	function deny() {
		localStorage.setItem(CONSENT_KEY, "denied");
		setVisible(false);
	}

	if (!visible) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
			<div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-lg sm:flex-row sm:items-start sm:gap-5">
				<p className="text-sm text-muted-foreground">
					Spletna stran uporablja piškotke za analitiko obiska. S klikom na
					&quot;Sprejmi&quot; se strinjaš z uporabo piškotkov.
				</p>
				<div className="flex shrink-0 gap-2">
					<Button size="sm" variant="outline" onClick={deny}>
						Zavrni
					</Button>
					<Button size="sm" onClick={accept}>
						Sprejmi
					</Button>
				</div>
			</div>
		</div>
	);
}
