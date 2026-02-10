import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { travelEntryBySlugQuery } from "@/lib/sanity.queries";
import type { TravelEntry } from "@/types/sanity";
import { render } from "vike/abort";

export type Data = TravelEntry;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const entry = await sanityClient.fetch<TravelEntry>(travelEntryBySlugQuery, { slug });
	if (!entry) throw render(404, "Travel entry not found");
	return entry;
}
