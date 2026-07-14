export const SITE_NAME = "Eva-licious";
export const SITE_DESCRIPTION = "Božanski recepti in nasveti za potepanje po svetu";
export const SITE_URL =
	typeof window === "undefined"
		? (process.env.BETTER_AUTH_URL ?? "http://localhost:3100")
		: window.location.origin;

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
