"use client";

import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import {
	type ConsentValue,
	onConsentChange,
	onConsentReopen,
	readConsent,
	reopenConsent,
	writeConsent,
} from "@/lib/consent";
import { useI18n } from "@/lib/i18n/react";

/** Current consent (null until chosen, and during server rendering). */
export function useCookieConsent(): ConsentValue {
	const [consent, setConsent] = useState<ConsentValue>(null);

	useEffect(() => {
		setConsent(readConsent());
		return onConsentChange(setConsent);
	}, []);

	return consent;
}

export function CookieConsent() {
	const { t, l } = useI18n();
	const pageContext = usePageContext();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (readConsent() === null) setVisible(true);
		return onConsentReopen(() => setVisible(true));
	}, []);

	function choose(value: boolean) {
		setVisible(false);
		writeConsent(value);
	}

	// Do not cover the policy pages the banner links to.
	if (!visible || /^\/(privacy|terms)$/.test(pageContext.urlPathname)) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
			<div
				role="dialog"
				aria-label={t("common.cookie.title")}
				className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-lg sm:flex-row sm:items-start sm:gap-5"
			>
				<p className="text-sm text-muted-foreground">
					{t("common.cookie.text")}{" "}
					<a href={l("/privacy")} className="underline underline-offset-4 hover:text-foreground">
						{t("common.cookie.more")}
					</a>
				</p>
				<div className="flex shrink-0 gap-2">
					<Button size="sm" variant="outline" onClick={() => choose(false)}>
						{t("common.cookie.deny")}
					</Button>
					<Button size="sm" onClick={() => choose(true)}>
						{t("common.cookie.accept")}
					</Button>
				</div>
			</div>
		</div>
	);
}

/** Footer link that lets a visitor change or withdraw their choice. */
export function CookieSettingsLink({ className }: { className?: string }) {
	const { t } = useI18n();
	return (
		<button type="button" className={className} onClick={reopenConsent}>
			{t("common.cookie.settings")}
		</button>
	);
}
