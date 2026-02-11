import type { PageContextServer } from "vike/types";
import { render } from "vike/abort";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import { courseFullQuery } from "@/lib/sanity.queries";
import { generateBunnyEmbedUrl } from "@/server/lib/bunny";
import type { CourseFull, StepFull } from "@/types/course";

export interface StepWithEmbed extends StepFull {
	embedUrl?: string;
}

export interface CourseFullWithEmbed {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: unknown;
	steps: StepWithEmbed[];
}

export type Data = {
	course: CourseFullWithEmbed;
	progress: Record<string, boolean>;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = (pageContext as Record<string, unknown>).user as { id: string } | null;
	if (!user) throw render(403, "Unauthorized");

	const { courseSlug } = pageContext.routeParams;

	const course = await sanityClient.fetch<CourseFull>(courseFullQuery, { slug: courseSlug });
	if (!course) throw render(404, "Course not found");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId: course._id } },
	});
	if (!access) throw render(403, "No access to this course");

	// Generate signed embed URLs for each step
	const stepsWithEmbed: StepWithEmbed[] = (course.steps ?? []).map((step) => ({
		...step,
		embedUrl: step.bunnyVideoId ? generateBunnyEmbedUrl(step.bunnyVideoId) : undefined,
	}));

	// Fetch progress
	const stepIds = stepsWithEmbed.map((s) => s._id);
	const progressRecords = await db.lessonProgress.findMany({
		where: { userId: user.id, lessonId: { in: stepIds } },
	});
	const progress: Record<string, boolean> = {};
	for (const p of progressRecords) {
		progress[p.lessonId] = p.completed;
	}

	return {
		course: { ...course, steps: stepsWithEmbed },
		progress,
	};
}
