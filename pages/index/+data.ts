import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
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

// The English home page is optional: until one exists the Slovenian one is shown
// (with English interface text).
async function fetchHomePage(locale: Locale) {
	const page = await sanityClient.fetch<HomePage>(homePageQuery, { locale });
	if (page || locale === DEFAULT_LOCALE) return page;
	return sanityClient.fetch<HomePage>(homePageQuery, { locale: DEFAULT_LOCALE });
}

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const [page, recentRecipes, recentBlogPosts, recentTravelEntries] = await Promise.all([
		fetchHomePage(locale),
		sanityClient.fetch<RecipeListing[]>(recentRecipesQuery, { locale }),
		sanityClient.fetch<BlogPost[]>(recentBlogPostsQuery, { locale }),
		sanityClient.fetch<TravelEntry[]>(recentTravelEntriesQuery, { locale }),
	]);
	return {
		...(page ?? { heroTitle: "Eva-licious" }),
		recentRecipes: recentRecipes ?? [],
		recentBlogPosts: recentBlogPosts ?? [],
		recentTravelEntries: recentTravelEntries ?? [],
	};
}
