import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { allTravelEntriesQuery } from "@/lib/sanity.queries";
import type { TravelEntry } from "@/types/sanity";

export type Data = { entries: TravelEntry[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const entries = await sanityClient.fetch<TravelEntry[]>(allTravelEntriesQuery, { locale });
	return { entries: entries ?? [] };
}
