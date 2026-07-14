import type { PageContextServer } from "vike/types";
import { allCoursesQuery } from "@/lib/sanity.queries";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import type { CourseListing } from "@/types/course";

interface CourseWithProgress extends CourseListing {
	progress: number;
}

export type Data = {
	courses: CourseWithProgress[];
	suggestions: CourseListing[];
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = pageContext.user;
	if (!user) return { courses: [], suggestions: [] };

	const accessRecords = await db.courseAccess.findMany({
		where: { userId: user.id },
	});

	const allCourses = await sanityClient.fetch<CourseListing[]>(allCoursesQuery);
	if (!allCourses) return { courses: [], suggestions: [] };

	const freeCourseProducts = await sanityClient.fetch<Array<{ courseId: string }>>(
		`*[_type == "product" && published == true && type == "ecourse" && priceInCents <= 0 && defined(course._ref)]{
			"courseId": course._ref
		}`,
	);
	const freeCourseIds = new Set((freeCourseProducts ?? []).map((p) => p.courseId));
	const accessedCourseIds = new Set(accessRecords.map((a) => a.courseId));
	const myCourses = allCourses.filter(
		(c) => accessedCourseIds.has(c._id) || freeCourseIds.has(c._id),
	);
	const suggestions = allCourses.filter(
		(c) => !accessedCourseIds.has(c._id) && !freeCourseIds.has(c._id),
	);

	if (myCourses.length === 0) {
		return { courses: [], suggestions };
	}

	const lessonProgress = await db.lessonProgress.findMany({
		where: { userId: user.id, completed: true },
	});
	const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));

	const coursesWithProgress: CourseWithProgress[] = myCourses.map((course) => ({
		...course,
		progress: 0,
	}));

	// For accurate progress, fetch step IDs for each course
	for (const course of coursesWithProgress) {
		const result = await sanityClient.fetch<{ stepIds: string[] }>(
			`*[_type == "course" && _id == $courseId][0] { "stepIds": steps[]->_id }`,
			{ courseId: course._id },
		);
		if (result?.stepIds) {
			const completed = result.stepIds.filter((id) => completedLessonIds.has(id)).length;
			course.progress =
				result.stepIds.length > 0 ? Math.round((completed / result.stepIds.length) * 100) : 0;
		}
	}

	return { courses: coursesWithProgress, suggestions };
}
