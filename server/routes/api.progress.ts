import { Hono } from "hono";
import { courseStepIdsQuery } from "@/lib/sanity.queries";
import { db } from "../lib/db.js";
import { canAccessLesson, isFreePublishedCourse } from "../lib/product-access.js";
import { sanityClient } from "../lib/sanity.js";
import { requireAuth } from "../middleware/guard.js";

type ProgressVariables = {
	user: { id: string };
};

export const progressHandler = new Hono<{ Variables: ProgressVariables }>();

progressHandler.use("*", requireAuth);

// Get progress for a course (filtered by course steps)
progressHandler.get("/:courseId", async (c) => {
	const user = c.get("user");
	const courseId = c.req.param("courseId");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId } },
	});
	if (!access && !(await isFreePublishedCourse(courseId))) {
		return c.json({ error: "No access" }, 403);
	}

	// Fetch step IDs for this course from Sanity
	const result = await sanityClient.fetch<{ stepIds: string[] }>(courseStepIdsQuery, { courseId });
	const stepIds = result?.stepIds ?? [];

	if (stepIds.length === 0) return c.json([]);

	const progress = await db.lessonProgress.findMany({
		where: { userId: user.id, lessonId: { in: stepIds } },
	});
	return c.json(progress);
});

// Reset all progress for a course
progressHandler.delete("/:courseId", async (c) => {
	const user = c.get("user");
	const courseId = c.req.param("courseId");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId } },
	});
	if (!access && !(await isFreePublishedCourse(courseId))) {
		return c.json({ error: "No access" }, 403);
	}

	// Fetch step IDs for this course from Sanity
	const result = await sanityClient.fetch<{ stepIds: string[] }>(courseStepIdsQuery, { courseId });
	const stepIds = result?.stepIds ?? [];

	if (stepIds.length > 0) {
		await db.lessonProgress.deleteMany({
			where: { userId: user.id, lessonId: { in: stepIds } },
		});
	}

	return c.json({ ok: true });
});

// Toggle lesson completion
progressHandler.post("/lesson/:lessonId", async (c) => {
	const user = c.get("user");
	const lessonId = c.req.param("lessonId");
	const { completed } = await c.req.json<{ completed: boolean }>();
	if (!lessonId || lessonId.length > 200 || typeof completed !== "boolean") {
		return c.json({ error: "Invalid progress update" }, 400);
	}

	const course = await sanityClient.fetch<{ _id: string; lessonIsFree: boolean } | null>(
		`*[_type == "course" && $lessonId in steps[]._ref][0]{
			_id,
			"lessonIsFree": coalesce(steps[_ref == $lessonId][0]->isFree, false)
		}`,
		{ lessonId },
	);
	if (!course) {
		return c.json({ error: "Lesson not found" }, 404);
	}

	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId: course._id } },
	});
	const courseIsFree =
		course.lessonIsFree || access ? false : await isFreePublishedCourse(course._id);
	if (
		!canAccessLesson({
			lessonIsFree: course.lessonIsFree,
			hasCourseAccess: !!access,
			courseIsFree,
		})
	) {
		return c.json({ error: "No access" }, 403);
	}

	const progress = await db.lessonProgress.upsert({
		where: { userId_lessonId: { userId: user.id, lessonId } },
		create: {
			userId: user.id,
			lessonId,
			completed,
			completedAt: completed ? new Date() : null,
		},
		update: {
			completed,
			completedAt: completed ? new Date() : null,
		},
	});

	return c.json(progress);
});
