import { AffiliateDisclosure } from "@/components/shared/AffiliateDisclosure";
import { affiliateUrl, bookingSearchUrl } from "@/lib/affiliate";

interface StayBoxProps {
	location?: string;
	country?: string;
	/** Sub-ID for affiliate reports, usually the page slug. */
	label: string;
	showDisclosure?: boolean;
}

/** "Where to stay" link to Booking.com. Renders nothing until Booking.com tracking is configured. */
export function StayBox({ location, country, label, showDisclosure = true }: StayBoxProps) {
	const destination = [location, country].filter(Boolean).join(", ");
	if (!destination) return null;
	const href = affiliateUrl(bookingSearchUrl(destination), label);
	if (!href) return null;

	return (
		<aside className="mt-12 rounded-xl border border-border bg-card p-6">
			<h2 className="font-serif text-2xl font-bold">Kje prespati: {location ?? country}</h2>
			<p className="mt-2 text-muted-foreground">Primerjaj nastanitve in cene na Booking.com.</p>
			<a
				href={href}
				target="_blank"
				rel="sponsored noopener noreferrer"
				className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Poglej nastanitve
			</a>
			{showDisclosure && <AffiliateDisclosure className="mt-4" />}
		</aside>
	);
}
