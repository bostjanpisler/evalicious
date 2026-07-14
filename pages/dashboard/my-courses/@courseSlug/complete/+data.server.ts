import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { allCoursesQuery, courseFullQuery } from "@/lib/sanity.queries";
import { db } from "@/server/lib/db";
import { isFreePublishedCourse } from "@/server/lib/product-access";
import { sanityClient } from "@/server/lib/sanity";
import type { CourseFull, CourseListing } from "@/types/course";

export interface RecommendedCourse {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: unknown;
	stepCount: number;
}

export type Data = {
	courseTitle: string;
	courseSlug: string;
	totalSteps: number;
	completedSteps: number;
	recommendations: RecommendedCourse[];
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = pageContext.user;
	if (!user) throw render(403, "Unauthorized");

	const { courseSlug } = pageContext.routeParams;

	const [course, allCourses] = await Promise.all([
		sanityClient.fetch<CourseFull & { tags?: string[] }>(
			courseFullQuery.replace("coverImage,", "coverImage, tags,"),
			{ slug: courseSlug },
		),
		sanityClient.fetch<CourseListing[]>(allCoursesQuery),
	]);
	if (!course) throw render(404, "Course not found");

	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId: course._id } },
	});
	if (!access && !(await isFreePublishedCourse(course._id))) {
		throw render(403, "No access");
	}

	const stepIds = (course.steps ?? []).map((s) => s._id);
	const completed = await db.lessonProgress.count({
		where: { userId: user.id, lessonId: { in: stepIds }, completed: true },
	});

	// Find courses user doesn't own, sorted by tag overlap
	const allAccess = await db.courseAccess.findMany({
		where: { userId: user.id },
		select: { courseId: true },
	});
	const ownedIds = new Set(allAccess.map((a) => a.courseId));
	const courseTags = new Set(course.tags ?? []);

	const unowned = (allCourses ?? [])
		.filter((c) => !ownedIds.has(c._id))
		.map((c) => ({
			...c,
			tagOverlap: (c.tags ?? []).filter((t) => courseTags.has(t)).length,
		}))
		.sort((a, b) => b.tagOverlap - a.tagOverlap)
		.slice(0, 3);

	return {
		courseTitle: course.title,
		courseSlug: course.slug,
		totalSteps: stepIds.length,
		completedSteps: completed,
		recommendations: unowned.map(({ tagOverlap, tags, publishedAt, ...rest }) => rest),
	};
}
