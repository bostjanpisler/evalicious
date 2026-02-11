import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { courseBySlugQuery } from "@/lib/sanity.queries";
import type { CourseOverview } from "@/types/course";
import { render } from "vike/abort";

export type Data = CourseOverview;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const course = await sanityClient.fetch<CourseOverview>(courseBySlugQuery, { slug });
	if (!course) throw render(404, "Course not found");
	return course;
}
