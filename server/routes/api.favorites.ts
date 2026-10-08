import { Hono } from "hono";
import { db } from "../lib/db.js";
import { recipeRootId, requestLocale, resolveRecipes } from "../lib/recipe-i18n.js";
import { requireAuth } from "../middleware/guard.js";

type FavoritesVariables = {
	user: { id: string };
};

export const favoritesHandler = new Hono<{ Variables: FavoritesVariables }>();

favoritesHandler.use("*", requireAuth);

// Get user favorites (recipes come back in the requested language)
favoritesHandler.get("/", async (c) => {
	const user = c.get("user");
	const locale = requestLocale(c.req.query("locale"));
	const favorites = await db.userFavorite.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
	const recipeIds = favorites
		.filter((favorite) => favorite.contentType === "recipe")
		.map((favorite) => favorite.contentId);
	const resolved = await resolveRecipes(recipeIds, locale);

	return c.json(
		favorites.map((favorite) => {
			const group = resolved.get(favorite.contentId);
			return { ...favorite, recipe: group?.recipe, recipeIds: group?.ids ?? [favorite.contentId] };
		}),
	);
});

// Toggle favorite
favoritesHandler.post("/toggle", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<{
		contentType: string;
		contentId: string;
	}>();
	const { contentType } = body;
	const contentId = contentType === "recipe" ? await recipeRootId(body.contentId) : body.contentId;

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
