import { sanityClient } from "@/server/lib/sanity";
import {
	homePageQuery,
	recentRecipesQuery,
	recentBlogPostsQuery,
	recentTravelEntriesQuery,
	recentCoursesQuery,
} from "@/lib/sanity.queries";
import type { HomePage, BlogPost, TravelEntry } from "@/types/sanity";
import type { RecipeListing } from "@/types/recipe";
import type { CourseListing } from "@/types/course";

export type Data = HomePage;

export async function data(): Promise<Data> {
	const [page, recentRecipes, recentBlogPosts, recentTravelEntries, courses] =
		await Promise.all([
			sanityClient.fetch<HomePage>(homePageQuery),
			sanityClient.fetch<RecipeListing[]>(recentRecipesQuery),
			sanityClient.fetch<BlogPost[]>(recentBlogPostsQuery),
			sanityClient.fetch<TravelEntry[]>(recentTravelEntriesQuery),
			sanityClient.fetch<CourseListing[]>(recentCoursesQuery),
		]);
	return {
		...(page ?? {
			heroTitle: "Eva-Licious",
			heroSubtitle: "Recepti, življenjski slog, potovanja in več.",
		}),
		recentRecipes: recentRecipes ?? [],
		recentBlogPosts: recentBlogPosts ?? [],
		recentTravelEntries: recentTravelEntries ?? [],
		courses: courses ?? [],
	};
}
