import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
	priceInCents: number;
	currency?: string;
	className?: string;
}

export function PriceDisplay({ priceInCents, currency = "EUR", className }: PriceDisplayProps) {
	if (priceInCents <= 0) {
		return <span className={className}>Brezplačno</span>;
	}

	return <span className={className}>{formatPrice(priceInCents, currency)}</span>;
}
