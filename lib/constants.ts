import type { TranslationKey, Translator } from "@/lib/i18n/messages";
export const SITE_NAME = "Eva-licious";
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

export const NAV_ITEMS = [
	{ key: "recipes", href: "/recipes" },
	{ key: "courses", href: "/courses" },
	{ key: "blog", href: "/blog" },
	{ key: "shop", href: "/shop" },
	{ key: "travel", href: "/travel" },
	{ key: "about", href: "/about" },
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

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

/** Translated category name; unknown ids (e.g. new CMS values) are shown as-is. */
export function recipeCategoryLabel(t: Translator, id: string): string {
	return (RECIPE_CATEGORIES as readonly string[]).includes(id)
		? t(`recipes.categories.${id}` as TranslationKey)
		: id;
}

/** Translated difficulty name; unknown ids are shown as-is. */
export function recipeDifficultyLabel(t: Translator, id: string): string {
	return (RECIPE_DIFFICULTIES as readonly string[]).includes(id)
		? t(`recipes.difficulty.${id}` as TranslationKey)
		: id;
}
