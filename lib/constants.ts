export const SITE_NAME = "Eva-licious";
export const SITE_DESCRIPTION = "Božanski recepti in nasveti za potepanje po svetu";
export const SITE_URL =
	typeof window === "undefined"
		? (process.env.BETTER_AUTH_URL ?? "http://localhost:3100")
		: window.location.origin;

// Third-party embeds (Google Maps, Klook, TikTok) are served from a different origin
// than the site, so they can keep their own storage without access to the site's.
const EMBED_ORIGINS: Record<string, string> = {
	"https://eva-licious.com": "https://evalicious-production.up.railway.app",
	"http://localhost:3100": "http://embed.localhost:3100",
};

export function embedOriginFor(siteUrl: string): string {
	return EMBED_ORIGINS[siteUrl] ?? "";
}

/** Matches by host only: behind Railway's proxy the request URL's scheme is http. */
export function isEmbedHost(host: string | undefined | null): boolean {
	if (!host) return false;
	return Object.values(EMBED_ORIGINS).some((origin) => new URL(origin).host === host);
}

export const EMBED_ORIGIN_LIST = Object.values(EMBED_ORIGINS);

export const FREE_DOWNLOAD_CONSENT_TEXT =
	"Strinjam se, da mi Eva-licious na e-poštni naslov pošlje brezplačno gradivo ter občasne novice, recepte in ponudbe. Odjava je mogoča kadarkoli.";

export const NAV_ITEMS = [
	{ label: "Recepti", href: "/recipes" },
	{ label: "Tečaji", href: "/courses" },
	{ label: "Blog", href: "/blog" },
	{ label: "Trgovina", href: "/shop" },
	{ label: "Potovanja", href: "/travel" },
	{ label: "O meni", href: "/about" },
] as const;

export const RECIPE_CATEGORIES = [
	"breakfast",
	"main",
	"sides",
	"snack",
	"dessert",
	"drink",
	"basics",
] as const;

export const HOMEPAGE_CATEGORIES = [
	"breakfast",
	"main",
	"sides",
	"snack",
	"dessert",
	"drink",
] as const;

export const RECIPE_CATEGORY_LABELS: Record<string, string> = {
	breakfast: "Zajtrki",
	main: "Glavne jedi",
	sides: "Priloge in solate",
	snack: "Prigrizki",
	dessert: "Sladice",
	drink: "Napitki",
	basics: "Osnovni recepti",
};

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const RECIPE_DIFFICULTY_LABELS: Record<string, string> = {
	easy: "🟢 Čist simple",
	medium: "🟡 Klasika",
	hard: "🔴 Boss level",
};
