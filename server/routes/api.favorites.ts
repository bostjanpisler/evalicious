import { Hono } from "hono";
import { db } from "../lib/db.js";
import { sanityClient } from "../lib/sanity.js";
import { requireAuth } from "../middleware/guard.js";

type FavoritesVariables = {
	user: { id: string };
};

export const favoritesHandler = new Hono<{ Variables: FavoritesVariables }>();

favoritesHandler.use("*", requireAuth);

// Get user favorites
favoritesHandler.get("/", async (c) => {
	const user = c.get("user");
	const favorites = await db.userFavorite.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
	const recipeIds = favorites
		.filter((favorite) => favorite.contentType === "recipe")
		.map((favorite) => favorite.contentId);
	const recipes = recipeIds.length
		? ((await sanityClient.fetch<
				Array<{
					_id: string;
					title: string;
					slug: string;
					coverImage?: unknown;
					categories?: string[];
					cuisine?: string;
					difficulty?: string;
					prepTime?: number;
					cookTime?: number;
				}>
			>(
				`*[_type == "recipe" && _id in $ids && published == true]{
					_id, title, "slug": slug.current, coverImage, categories, cuisine,
					difficulty, prepTime, cookTime
				}`,
				{ ids: recipeIds },
			)) ?? [])
		: [];
	const recipeById = new Map(recipes.map((recipe) => [recipe._id, recipe]));

	return c.json(
		favorites.map((favorite) => ({
			...favorite,
			recipe: recipeById.get(favorite.contentId),
		})),
	);
});

// Toggle favorite
favoritesHandler.post("/toggle", async (c) => {
	const user = c.get("user");
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
