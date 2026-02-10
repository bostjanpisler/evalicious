export const SITE_NAME = "Eva-Licious";
export const SITE_DESCRIPTION =
	"Recipes, lifestyle, travel, and more from Eva's kitchen and beyond.";
export const SITE_URL =
	typeof window === "undefined"
		? (process.env.BETTER_AUTH_URL ?? "http://localhost:3100")
		: window.location.origin;

export const NAV_ITEMS = [
	{ label: "Recipes", href: "/recipes" },
	{ label: "Blog", href: "/blog" },
	{ label: "Travel", href: "/travel" },
	{ label: "Shop", href: "/shop" },
	{ label: "About", href: "/about" },
] as const;

export const RECIPE_CATEGORIES = [
	"breakfast",
	"lunch",
	"dinner",
	"dessert",
	"snack",
	"drink",
] as const;

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
