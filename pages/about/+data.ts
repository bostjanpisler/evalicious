import { sanityClient } from "@/server/lib/sanity";
import { aboutPageQuery } from "@/lib/sanity.queries";
import type { AboutPage } from "@/types/sanity";

export type Data = AboutPage;

export async function data(): Promise<Data> {
	const page = await sanityClient.fetch<AboutPage>(aboutPageQuery);
	return page ?? { bio: [], socialLinks: [] };
}
