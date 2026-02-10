import { sanityClient } from "@/server/lib/sanity";
import { allRecipesQuery } from "@/lib/sanity.queries";
import type { RecipeListing } from "@/types/recipe";

export type Data = { recipes: RecipeListing[] };

export async function data(): Promise<Data> {
	const recipes = await sanityClient.fetch<RecipeListing[]>(allRecipesQuery);
	return { recipes: recipes ?? [] };
}
