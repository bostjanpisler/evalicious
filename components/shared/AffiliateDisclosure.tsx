export const AFFILIATE_DISCLOSURE_TEXT =
	"Ta stran vsebuje affiliate povezave. Če kupiš ali rezerviraš preko njih, dobim majhno provizijo, zate pa se cena ne spremeni. Priporočam samo stvari, ki jih zares uporabljam ali bi jih.";

export function AffiliateDisclosure({ className }: { className?: string }) {
	return (
		<p className={`text-xs leading-relaxed text-muted-foreground ${className ?? ""}`}>
			{AFFILIATE_DISCLOSURE_TEXT}
		</p>
	);
}
