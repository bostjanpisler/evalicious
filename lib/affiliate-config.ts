// Affiliate tracking setup. Nothing here is secret (affiliate IDs are visible in
// every link), but a program stays OFF until its entry is filled in, so links are
// never rewritten with a half-configured ID.
//
// Two ways to configure a program:
//   template: wrap the destination in the network's deep link. {url} is the
//             URL-encoded destination, {label} an URL-encoded sub-ID (the page slug).
//             Booking.com goes through CJ or Awin, so paste a deep link they
//             generated and swap the destination for {url} and the sub-ID for {label}.
//   params:   append query parameters to the destination (Amazon's `tag`, iHerb's `rcode`).
export type AffiliateRule = {
	template?: string;
	params?: Record<string, string>;
};

export const AFFILIATE_RULES: Record<string, AffiliateRule> = {
	// Booking.com via CJ (site 101899632, link 17343481). CJ appends {label} to the
	// click as the sub-ID, so the post slug shows up in the CJ reports.
	booking: {
		template: "https://www.anrdoezrs.net/click-101899632-17343481?url={url}&sid={label}",
	},
	amazon: {},
	iherb: {},
};

// Which program a destination host belongs to.
export const AFFILIATE_PROGRAM_HOSTS: Record<string, string[]> = {
	booking: ["booking.com"],
	amazon: ["amazon.de", "amazon.com", "amazon.co.uk", "amazon.it", "amazon.fr", "amazon.es"],
	iherb: ["iherb.com"],
};

// Tracking/redirect domains of affiliate networks and link shorteners. A link that
// already points at one of these (pasted into Sanity by hand) is an affiliate link.
export const AFFILIATE_NETWORK_HOSTS = [
	"anrdoezrs.net",
	"tkqlhce.com",
	"jdoqocy.com",
	"kqzyfj.com",
	"dpbolvw.net",
	"awin1.com",
	"zenaps.com",
	"shareasale.com",
	"amzn.to",
	"amzn.eu",
	"go.skimresources.com",
	"klook.com",
	"getyourguide.com",
	"tp.media",
];
