"use client";

import { useI18n } from "@/lib/i18n/react";

export function AffiliateDisclosure({ className }: { className?: string }) {
	const { t } = useI18n();
	return (
		<p className={`text-xs leading-relaxed text-muted-foreground ${className ?? ""}`}>
			{t("common.affiliate.disclosure")}
		</p>
	);
}
