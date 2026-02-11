import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface Ingredient {
	name: string;
	amount?: string;
	unit?: string;
	optional?: boolean;
}

export interface IngredientGroup {
	groupName?: string;
	items: Ingredient[];
}

export interface Step {
	instruction: string;
	tip?: string;
}

export interface StepGroup {
	groupName?: string;
	items: Step[];
}

export interface NutritionInfo {
	calories?: number;
	protein?: number;
	fat?: number;
	carbs?: number;
}

export interface RecipeListing {
	_id: string;
	title: string;
	slug: string;
	coverImage?: SanityImageSource;
	category?: string;
	cuisine?: string;
	difficulty?: string;
	prepTime?: number;
	cookTime?: number;
	tags?: string[];
	publishedAt?: string;
}

export interface RecipeFull extends RecipeListing {
	description?: string;
	servings?: number;
	ingredientGroups: IngredientGroup[];
	stepGroups: StepGroup[];
	nutritionInfo?: NutritionInfo;
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
	relatedRecipes?: RecipeListing[];
}
