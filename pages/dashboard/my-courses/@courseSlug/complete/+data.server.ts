import type { PageContextServer } from "vike/types";
import { render } from "vike/abort";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import { courseFullQuery } from "@/lib/sanity.queries";
import type { CourseFull } from "@/types/course";

export type Data = {
	courseTitle: string;
	courseSlug: string;
	totalSteps: number;
	completedSteps: number;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = (pageContext as Record<string, unknown>).user as { id: string } | null;
	if (!user) throw render(403, "Unauthorized");

	const { courseSlug } = pageContext.routeParams;

	const course = await sanityClient.fetch<CourseFull>(courseFullQuery, { slug: courseSlug });
	if (!course) throw render(404, "Course not found");

	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId: course._id } },
	});
	if (!access) throw render(403, "No access");

	const stepIds = (course.steps ?? []).map((s) => s._id);
	const completed = await db.lessonProgress.count({
		where: { userId: user.id, lessonId: { in: stepIds }, completed: true },
	});

	return {
		courseTitle: course.title,
		courseSlug: course.slug,
		totalSteps: stepIds.length,
		completedSteps: completed,
	};
}
