import { sanityClient } from "@/server/lib/sanity";
import { allCoursesQuery } from "@/lib/sanity.queries";
import type { CourseListing } from "@/types/course";

export type Data = { courses: CourseListing[] };

export async function data(): Promise<Data> {
	const courses = await sanityClient.fetch<CourseListing[]>(allCoursesQuery);
	return { courses: courses ?? [] };
}
