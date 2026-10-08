import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/react";

const PRICE_LOCALES: Record<Locale, string> = { sl: "sl-SI", en: "en-GB" };

function formatLocalizedPrice(cents: number, currency: string, locale: Locale): string {
	return new Intl.NumberFormat(PRICE_LOCALES[locale], {
		style: "currency",
		currency,
	}).format(cents / 100);
}

interface PriceDisplayProps {
	priceInCents: number;
	currency?: string;
	className?: string;
}

export function PriceDisplay({ priceInCents, currency = "EUR", className }: PriceDisplayProps) {
	const { t, locale } = useI18n();

	if (priceInCents <= 0) {
		return <span className={className}>{t("shop.price.free")}</span>;
	}

	return <span className={className}>{formatLocalizedPrice(priceInCents, currency, locale)}</span>;
}
