import { Hono } from "hono";
import { requireAuth } from "../middleware/guard.js";
import { db } from "../lib/db.js";
import { sanityClient } from "../lib/sanity.js";
import { courseStepIdsQuery } from "@/lib/sanity.queries";

export const progressHandler = new Hono();

progressHandler.use("*", requireAuth);

// Get progress for a course (filtered by course steps)
progressHandler.get("/:courseId", async (c) => {
	const user = c.get("user") as { id: string };
	const courseId = c.req.param("courseId");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId } },
	});
	if (!access) return c.json({ error: "No access" }, 403);

	// Fetch step IDs for this course from Sanity
	const result = await sanityClient.fetch<{ stepIds: string[] }>(
		courseStepIdsQuery,
		{ courseId },
	);
	const stepIds = result?.stepIds ?? [];

	if (stepIds.length === 0) return c.json([]);

	const progress = await db.lessonProgress.findMany({
		where: { userId: user.id, lessonId: { in: stepIds } },
	});
	return c.json(progress);
});

// Reset all progress for a course
progressHandler.delete("/:courseId", async (c) => {
	const user = c.get("user") as { id: string };
	const courseId = c.req.param("courseId");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId } },
	});
	if (!access) return c.json({ error: "No access" }, 403);

	// Fetch step IDs for this course from Sanity
	const result = await sanityClient.fetch<{ stepIds: string[] }>(
		courseStepIdsQuery,
		{ courseId },
	);
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
	const user = c.get("user") as { id: string };
	const lessonId = c.req.param("lessonId");
	const { completed } = await c.req.json<{ completed: boolean }>();

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
