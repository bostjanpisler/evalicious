import { Hono } from "hono";
import { requireAuth } from "../middleware/guard.js";
import { db } from "../lib/db.js";

export const favoritesHandler = new Hono();

favoritesHandler.use("*", requireAuth);

// Get user favorites
favoritesHandler.get("/", async (c) => {
	const user = c.get("user") as { id: string };
	const favorites = await db.userFavorite.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
	return c.json(favorites);
});

// Toggle favorite
favoritesHandler.post("/toggle", async (c) => {
	const user = c.get("user") as { id: string };
	const { contentType, contentId } = await c.req.json<{
		contentType: string;
		contentId: string;
	}>();

	const existing = await db.userFavorite.findUnique({
		where: { userId_contentId: { userId: user.id, contentId } },
	});

	if (existing) {
		await db.userFavorite.delete({ where: { id: existing.id } });
		return c.json({ favorited: false });
	}

	await db.userFavorite.create({
		data: { userId: user.id, contentType, contentId },
	});
	return c.json({ favorited: true });
});
