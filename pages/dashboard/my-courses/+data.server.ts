import type { PageContextServer } from "vike/types";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import { allCoursesQuery } from "@/lib/sanity.queries";
import type { CourseListing } from "@/types/course";

interface CourseWithProgress extends CourseListing {
	progress: number;
}

export type Data = { courses: CourseWithProgress[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = (pageContext as Record<string, unknown>).user as { id: string } | null;
	if (!user) return { courses: [] };

	const accessRecords = await db.courseAccess.findMany({
		where: { userId: user.id },
	});

	if (accessRecords.length === 0) return { courses: [] };

	const allCourses = await sanityClient.fetch<CourseListing[]>(allCoursesQuery);
	if (!allCourses) return { courses: [] };

	const accessedCourseIds = new Set(accessRecords.map((a) => a.courseId));
	const myCourses = allCourses.filter((c) => accessedCourseIds.has(c._id));

	const lessonProgress = await db.lessonProgress.findMany({
		where: { userId: user.id, completed: true },
	});
	const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));

	const coursesWithProgress: CourseWithProgress[] = myCourses.map((course) => {
		const total = course.stepCount;
		// We don't have individual step IDs here, so use count-based approximation
		// The actual per-course filtering happens on the course detail page
		return {
			...course,
			progress: total > 0 ? 0 : 0, // Will be calculated properly below
		};
	});

	// For accurate progress, fetch step IDs for each course
	for (const course of coursesWithProgress) {
		const result = await sanityClient.fetch<{ stepIds: string[] }>(
			`*[_type == "course" && _id == $courseId][0] { "stepIds": steps[]->_id }`,
			{ courseId: course._id },
		);
		if (result?.stepIds) {
			const completed = result.stepIds.filter((id) => completedLessonIds.has(id)).length;
			course.progress = result.stepIds.length > 0
				? Math.round((completed / result.stepIds.length) * 100)
				: 0;
		}
	}

	return { courses: coursesWithProgress };
}
