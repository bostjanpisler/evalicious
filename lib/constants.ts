export const SITE_NAME = "Eva-Licious";
export const SITE_DESCRIPTION = "Okusni recepti iz Evine kuhinje.";
export const SITE_URL =
	typeof window === "undefined"
		? (process.env.BETTER_AUTH_URL ?? "http://localhost:3100")
		: window.location.origin;

export const NAV_ITEMS = [
	{ label: "Recepti", href: "/recipes" },
	{ label: "O meni", href: "/about" },
] as const;

export const RECIPE_CATEGORIES = [
	"breakfast",
	"lunch",
	"dinner",
	"dessert",
	"snack",
	"drink",
] as const;

export const RECIPE_CATEGORY_LABELS: Record<string, string> = {
	breakfast: "Zajtrk",
	lunch: "Kosilo",
	dinner: "Večerja",
	dessert: "Sladica",
	snack: "Prigrizek",
	drink: "Napitek",
};

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const RECIPE_DIFFICULTY_LABELS: Record<string, string> = {
	easy: "Enostavno",
	medium: "Srednje",
	hard: "Zahtevno",
};
