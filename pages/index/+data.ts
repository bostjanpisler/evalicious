import { sanityClient } from "@/server/lib/sanity";
import { homePageQuery } from "@/lib/sanity.queries";
import type { HomePage } from "@/types/sanity";

export type Data = HomePage;

export async function data(): Promise<Data> {
	const result = await sanityClient.fetch<HomePage>(homePageQuery);
	return result ?? { heroTitle: "Eva-Licious", heroSubtitle: "Recipes, lifestyle & more" };
}
