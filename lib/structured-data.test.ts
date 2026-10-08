import { describe, expect, test } from "bun:test";
import type { RecipeFull } from "@/types/recipe";
import {
	articleJsonLd,
	isoDuration,
	recipeJsonLd,
	serializeJsonLd,
	siteJsonLd,
} from "./structured-data";

const recipe: RecipeFull = {
	_id: "r1",
	title: "Oat porridge",
	slug: "oat-porridge",
	description: "A quick breakfast.",
	publishedAt: "2026-02-24T10:00:00Z",
	prepTime: 5,
	cookTime: 85,
	servings: 2,
	categories: ["breakfast"],
	cuisine: "Slovenian",
	tags: ["vegan", "oil-free"],
	glutenFree: true,
	ingredientGroups: [
		{
			groupName: "Porridge",
			items: [{ name: "rolled oats", amount: "1", unit: "cup" }, { name: "salt" }],
		},
	],
	stepGroups: [
		{
			items: [{ instruction: "Cook the oats. " }, { instruction: "  " }, { instruction: "Serve." }],
		},
	],
	nutritionInfo: { calories: 320, protein: 12 },
};

describe("isoDuration", () => {
	test("formats minutes as ISO 8601", () => {
		expect(isoDuration(5)).toBe("PT5M");
		expect(isoDuration(60)).toBe("PT1H");
		expect(isoDuration(90)).toBe("PT1H30M");
		expect(isoDuration(0)).toBeUndefined();
		expect(isoDuration(undefined)).toBeUndefined();
	});
});

describe("recipeJsonLd", () => {
	const json = recipeJsonLd(recipe, {
		url: "https://eva-licious.com/en/recipes/oat-porridge",
		locale: "en",
		images: ["https://img/1.jpg"],
	}) as Record<string, unknown>;

	test("describes the recipe for Google", () => {
		expect(json["@type"]).toBe("Recipe");
		expect(json.name).toBe("Oat porridge");
		expect(json.inLanguage).toBe("en");
		expect(json.prepTime).toBe("PT5M");
		expect(json.totalTime).toBe("PT1H30M");
		expect(json.recipeYield).toBe("2");
		expect(json.recipeIngredient).toEqual(["1 cup rolled oats", "salt"]);
		expect(json.recipeInstructions).toEqual([
			{ "@type": "HowToStep", text: "Cook the oats." },
			{ "@type": "HowToStep", text: "Serve." },
		]);
		expect(json.suitableForDiet).toEqual([
			"https://schema.org/VeganDiet",
			"https://schema.org/GlutenFreeDiet",
		]);
		expect(json.nutrition).toEqual({
			"@type": "NutritionInformation",
			calories: "320 calories",
			proteinContent: "12 g",
		});
	});

	test("omits what the recipe doesn't have instead of emitting empty values", () => {
		const sparse = recipeJsonLd(
			{
				...recipe,
				tags: [],
				glutenFree: false,
				nutritionInfo: undefined,
				prepTime: undefined,
				cookTime: undefined,
				servings: undefined,
			},
			{ url: "u", locale: "sl", images: [] },
		) as Record<string, unknown>;
		for (const key of [
			"prepTime",
			"totalTime",
			"recipeYield",
			"suitableForDiet",
			"nutrition",
			"image",
			"keywords",
		]) {
			expect(key in sparse, key).toBe(false);
		}
	});
});

describe("articleJsonLd / siteJsonLd / serializeJsonLd", () => {
	test("article headline is capped at 110 characters", () => {
		const json = articleJsonLd(
			{ title: "x".repeat(200) },
			{ url: "u", locale: "sl", images: [] },
		) as { headline: string };
		expect(json.headline.length).toBe(110);
	});

	test("site data has a WebSite and an Organization", () => {
		const types = siteJsonLd({
			origin: "https://eva-licious.com",
			locale: "sl",
			description: "d",
		}).map((item) => (item as { "@type": string })["@type"]);
		expect(types).toEqual(["WebSite", "Organization"]);
	});

	test("escapes '<' so content cannot close the script tag", () => {
		expect(serializeJsonLd({ a: "</script><b>" })).not.toContain("</script>");
		expect(JSON.parse(serializeJsonLd({ a: "</script>" }))).toEqual({ a: "</script>" });
	});
});
