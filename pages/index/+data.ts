import { sanityClient } from "@/server/lib/sanity";
import { homePageQuery, recentRecipesQuery } from "@/lib/sanity.queries";
import type { HomePage } from "@/types/sanity";
import type { RecipeListing } from "@/types/recipe";

export type Data = HomePage;

export async function data(): Promise<Data> {
	const [page, recentRecipes] = await Promise.all([
		sanityClient.fetch<HomePage>(homePageQuery),
		sanityClient.fetch<RecipeListing[]>(recentRecipesQuery),
	]);
	return {
		...(page ?? {
			heroTitle: "Eva-Licious",
			heroSubtitle: "Okusni recepti iz Evine kuhinje.",
		}),
		recentRecipes: recentRecipes ?? [],
	};
}
