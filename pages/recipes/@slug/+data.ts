import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { recipeBySlugQuery } from "@/lib/sanity.queries";
import type { RecipeFull } from "@/types/recipe";
import { render } from "vike/abort";

export type Data = RecipeFull;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const recipe = await sanityClient.fetch<RecipeFull>(recipeBySlugQuery, { slug });
	if (!recipe) throw render(404, "Recipe not found");
	return recipe;
}
