import { sanityClient } from "@/server/lib/sanity";
import {
	homePageQuery,
	recentRecipesQuery,
	recentBlogPostsQuery,
	recentTravelEntriesQuery,
} from "@/lib/sanity.queries";
import type { HomePage, BlogPost, TravelEntry } from "@/types/sanity";
import type { RecipeListing } from "@/types/recipe";

export type Data = HomePage;

export async function data(): Promise<Data> {
	const [page, recentRecipes, recentBlogPosts, recentTravelEntries] =
		await Promise.all([
			sanityClient.fetch<HomePage>(homePageQuery),
			sanityClient.fetch<RecipeListing[]>(recentRecipesQuery),
			sanityClient.fetch<BlogPost[]>(recentBlogPostsQuery),
			sanityClient.fetch<TravelEntry[]>(recentTravelEntriesQuery),
		]);
	return {
		...(page ?? {
			heroTitle: "Eva-licious",
			heroSubtitle: "Božanski recepti in nasveti za potepanje po svetu",
		}),
		recentRecipes: recentRecipes ?? [],
		recentBlogPosts: recentBlogPosts ?? [],
		recentTravelEntries: recentTravelEntries ?? [],
	};
}
