import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { allCoursesQuery } from "@/lib/sanity.queries";
import type { CourseListing } from "@/types/course";

export type Data = { courses: CourseListing[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const courses = await sanityClient.fetch<CourseListing[]>(allCoursesQuery, { locale });
	return { courses: courses ?? [] };
}
