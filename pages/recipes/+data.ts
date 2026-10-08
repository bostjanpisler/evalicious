import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { allRecipesQuery } from "@/lib/sanity.queries";
import type { RecipeListing } from "@/types/recipe";

export type Data = { recipes: RecipeListing[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const recipes = await sanityClient.fetch<RecipeListing[]>(allRecipesQuery, { locale });
	return { recipes: recipes ?? [] };
}
