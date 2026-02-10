import { Hono } from "hono";
import { requireAuth } from "../middleware/guard.js";
import { db } from "../lib/db.js";

export const progressHandler = new Hono();

progressHandler.use("*", requireAuth);

// Get progress for a course (all lessons)
progressHandler.get("/:courseId", async (c) => {
	const user = c.get("user") as { id: string };
	const courseId = c.req.param("courseId");

	// Verify access
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: user.id, courseId } },
	});
	if (!access) return c.json({ error: "No access" }, 403);

	const progress = await db.lessonProgress.findMany({
		where: { userId: user.id },
	});
	return c.json(progress);
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
