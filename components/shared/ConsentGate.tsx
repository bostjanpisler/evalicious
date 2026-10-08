"use client";

import type { ReactNode } from "react";
import { useCookieConsent } from "@/components/shared/CookieConsent";
import { Button } from "@/components/ui/button";
import { writeConsent } from "@/lib/consent";
import { useI18n } from "@/lib/i18n/react";

/**
 * Third-party content (maps, ad widgets, videos) sets its own cookies, so it only
 * loads once the visitor has agreed. Until then a placeholder explains why and
 * lets them agree in one click.
 */
export function ConsentGate({
	children,
	minHeight = 160,
}: {
	children: ReactNode;
	minHeight?: number;
}) {
	const { t, l } = useI18n();
	const consent = useCookieConsent();

	if (consent === true) return <>{children}</>;

	return (
		<div
			className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center"
			style={{ minHeight }}
		>
			<p className="max-w-md text-sm text-muted-foreground">
				{t("common.consentGate.text")}{" "}
				<a href={l("/privacy")} className="underline underline-offset-4 hover:text-foreground">
					{t("common.cookie.more")}
				</a>
			</p>
			{consent === false && (
				<p className="text-xs text-muted-foreground">{t("common.consentGate.declined")}</p>
			)}
			<Button size="sm" variant="outline" onClick={() => writeConsent(true)}>
				{t("common.consentGate.load")}
			</Button>
		</div>
	);
}
