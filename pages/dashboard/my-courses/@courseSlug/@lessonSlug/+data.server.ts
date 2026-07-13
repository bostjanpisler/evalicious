import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { courseFullQuery } from "@/lib/sanity.queries";
import { generateBunnyEmbedUrl } from "@/server/lib/bunny";
import { db } from "@/server/lib/db";
import { isFreePublishedCourse } from "@/server/lib/product-access";
import { sanityClient } from "@/server/lib/sanity";
import type { CourseFull, StepFull } from "@/types/course";

export interface StepView extends StepFull {
	embedUrl?: string;
}

interface SidebarStep {
	_id: string;
	slug: string;
	title: string;
}

export type Data = {
	courseTitle: string;
	courseSlug: string;
	step: StepView;
	steps: SidebarStep[];
	progress: Record<string, boolean>;
	prevStep: SidebarStep | null;
	nextStep: SidebarStep | null;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const user = (pageContext as Record<string, unknown>).user as { id: string } | null;
	if (!user) throw render(403, "Unauthorized");

	const { courseSlug, lessonSlug } = pageContext.routeParams;

	const course = await sanityClient.fetch<CourseFull>(courseFullQuery, { slug: courseSlug });
	if (!course) throw render(404, "Course not found");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId: course._id } },
	});
	if (!access && !(await isFreePublishedCourse(course._id))) {
		throw render(403, "No access to this course");
	}

	// Find the current step
	const steps = course.steps ?? [];
	const currentIndex = steps.findIndex((s) => s.slug === lessonSlug);
	if (currentIndex === -1) throw render(404, "Step not found");

	const currentStep = steps[currentIndex];

	// Generate signed embed URL
	const stepView: StepView = {
		...currentStep,
		embedUrl: currentStep.bunnyVideoId
			? generateBunnyEmbedUrl(currentStep.bunnyVideoId)
			: undefined,
	};

	// Fetch progress
	const stepIds = steps.map((s) => s._id);
	const progressRecords = await db.lessonProgress.findMany({
		where: { userId: user.id, lessonId: { in: stepIds } },
	});
	const progress: Record<string, boolean> = {};
	for (const p of progressRecords) {
		progress[p.lessonId] = p.completed;
	}

	// Navigation
	const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
	const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

	return {
		courseTitle: course.title,
		courseSlug: course.slug,
		step: stepView,
		steps: steps.map((s) => ({ _id: s._id, slug: s.slug, title: s.title })),
		progress,
		prevStep: prevStep ? { _id: prevStep._id, slug: prevStep.slug, title: prevStep.title } : null,
		nextStep: nextStep ? { _id: nextStep._id, slug: nextStep.slug, title: nextStep.title } : null,
	};
}
