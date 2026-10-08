import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { recipeBySlugQuery } from "@/lib/sanity.queries";
import type { RecipeFull } from "@/types/recipe";
import { render } from "vike/abort";

export type Data = RecipeFull;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const { slug } = pageContext.routeParams;
	const recipe = await sanityClient.fetch<RecipeFull>(recipeBySlugQuery, { slug, locale });
	if (!recipe) throw render(404, "Recipe not found");
	return recipe;
}
