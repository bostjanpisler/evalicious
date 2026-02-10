import { sanityClient } from "@/server/lib/sanity";
import { allTravelEntriesQuery } from "@/lib/sanity.queries";
import type { TravelEntry } from "@/types/sanity";

export type Data = { entries: TravelEntry[] };

export async function data(): Promise<Data> {
	const entries = await sanityClient.fetch<TravelEntry[]>(allTravelEntriesQuery);
	return { entries: entries ?? [] };
}
