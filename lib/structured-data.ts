// schema.org JSON-LD for search engines. Pure functions so they can be tested;
// pages render them with <JsonLd>.
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import type { RecipeFull } from "@/types/recipe";

export const AUTHOR = { "@type": "Person", name: "Eva Sušin" } as const;
const INSTAGRAM = "https://www.instagram.com/susiiiiin/";

/** Minutes as an ISO 8601 duration ("PT1H30M"), or undefined for no/zero time. */
export function isoDuration(minutes: number | undefined | null): string | undefined {
	if (!minutes || minutes <= 0) return undefined;
	const hours = Math.floor(minutes / 60);
	const rest = Math.round(minutes % 60);
	return `PT${hours ? `${hours}H` : ""}${rest ? `${rest}M` : ""}` || undefined;
}

function clean<T extends Record<string, unknown>>(value: T): T {
	return Object.fromEntries(
		Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== ""),
	) as T;
}

type ImageUrls = string[];

export function recipeJsonLd(
	recipe: RecipeFull,
	options: { url: string; locale: Locale; images: ImageUrls; description?: string },
) {
	const ingredients = recipe.ingredientGroups
		.flatMap((group) => group.items)
		.map((item) => [item.amount, item.unit, item.name].filter(Boolean).join(" ").trim())
		.filter(Boolean);
	const steps = recipe.stepGroups
		.flatMap((group) => group.items)
		.filter((step) => step.instruction?.trim())
		.map((step) => ({ "@type": "HowToStep", text: step.instruction.trim() }));

	const diets: string[] = [];
	if (recipe.tags?.some((tag) => /vegan/i.test(tag))) diets.push("https://schema.org/VeganDiet");
	if (recipe.glutenFree) diets.push("https://schema.org/GlutenFreeDiet");

	const nutrition = recipe.nutritionInfo;
	const total = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

	return clean({
		"@context": "https://schema.org",
		"@type": "Recipe",
		name: recipe.title,
		description: options.description ?? recipe.description,
		image: options.images.length ? options.images : undefined,
		author: AUTHOR,
		datePublished: recipe.publishedAt,
		inLanguage: HTML_LANG[options.locale],
		url: options.url,
		mainEntityOfPage: options.url,
		prepTime: isoDuration(recipe.prepTime),
		cookTime: isoDuration(recipe.cookTime),
		totalTime: isoDuration(total),
		recipeYield: recipe.servings ? String(recipe.servings) : undefined,
		recipeCategory: recipe.categories?.length ? recipe.categories.join(", ") : undefined,
		recipeCuisine: recipe.cuisine,
		keywords: recipe.tags?.length ? recipe.tags.join(", ") : undefined,
		suitableForDiet: diets.length ? diets : undefined,
		recipeIngredient: ingredients.length ? ingredients : undefined,
		recipeInstructions: steps.length ? steps : undefined,
		nutrition:
			nutrition && (nutrition.calories || nutrition.protein || nutrition.fat || nutrition.carbs)
				? clean({
						"@type": "NutritionInformation",
						calories: nutrition.calories ? `${nutrition.calories} calories` : undefined,
						proteinContent: nutrition.protein ? `${nutrition.protein} g` : undefined,
						fatContent: nutrition.fat ? `${nutrition.fat} g` : undefined,
						carbohydrateContent: nutrition.carbs ? `${nutrition.carbs} g` : undefined,
					})
				: undefined,
	});
}

export function articleJsonLd(
	entry: { title: string; description?: string; publishedAt?: string },
	options: { url: string; locale: Locale; images: ImageUrls },
) {
	return clean({
		"@context": "https://schema.org",
		"@type": "Article",
		headline: entry.title.slice(0, 110),
		description: entry.description,
		image: options.images.length ? options.images : undefined,
		author: AUTHOR,
		datePublished: entry.publishedAt,
		inLanguage: HTML_LANG[options.locale],
		mainEntityOfPage: options.url,
	});
}

export function siteJsonLd(options: { origin: string; locale: Locale; description: string }) {
	return [
		clean({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Eva-licious",
			url: options.origin,
			description: options.description,
			inLanguage: HTML_LANG[options.locale],
		}),
		clean({
			"@context": "https://schema.org",
			"@type": "Organization",
			name: "Eva-licious",
			url: options.origin,
			logo: `${options.origin}/images/email/eva-licious-wordmark.png`,
			founder: AUTHOR,
			sameAs: [INSTAGRAM],
		}),
	];
}

/** JSON for an inline <script>: "<" is escaped so content can never close the tag. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
