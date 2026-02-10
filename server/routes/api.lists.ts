import { Hono } from "hono";
import { requireAuth } from "../middleware/guard.js";
import { db } from "../lib/db.js";

export const listsHandler = new Hono();

listsHandler.use("*", requireAuth);

// Get user lists
listsHandler.get("/", async (c) => {
	const user = c.get("user") as { id: string };
	const lists = await db.userList.findMany({
		where: { userId: user.id },
		include: { items: true },
		orderBy: { updatedAt: "desc" },
	});
	return c.json(lists);
});

// Create list
listsHandler.post("/", async (c) => {
	const user = c.get("user") as { id: string };
	const { name, description } = await c.req.json<{
		name: string;
		description?: string;
	}>();
	const list = await db.userList.create({
		data: { userId: user.id, name, description },
	});
	return c.json(list, 201);
});

// Update list
listsHandler.patch("/:id", async (c) => {
	const user = c.get("user") as { id: string };
	const listId = c.req.param("id");
	const { name, description } = await c.req.json<{
		name?: string;
		description?: string;
	}>();

	const list = await db.userList.findFirst({
		where: { id: listId, userId: user.id },
	});
	if (!list) return c.json({ error: "Not found" }, 404);

	const updated = await db.userList.update({
		where: { id: listId },
		data: { ...(name && { name }), ...(description !== undefined && { description }) },
	});
	return c.json(updated);
});

// Delete list
listsHandler.delete("/:id", async (c) => {
	const user = c.get("user") as { id: string };
	const listId = c.req.param("id");

	const list = await db.userList.findFirst({
		where: { id: listId, userId: user.id },
	});
	if (!list) return c.json({ error: "Not found" }, 404);

	await db.userList.delete({ where: { id: listId } });
	return c.json({ deleted: true });
});

// Add item to list
listsHandler.post("/:id/items", async (c) => {
	const user = c.get("user") as { id: string };
	const listId = c.req.param("id");
	const { contentType, contentId } = await c.req.json<{
		contentType: string;
		contentId: string;
	}>();

	const list = await db.userList.findFirst({
		where: { id: listId, userId: user.id },
	});
	if (!list) return c.json({ error: "Not found" }, 404);

	const item = await db.userListItem.create({
		data: { listId, contentType, contentId },
	});
	return c.json(item, 201);
});

// Remove item from list
listsHandler.delete("/:id/items/:contentId", async (c) => {
	const user = c.get("user") as { id: string };
	const listId = c.req.param("id");
	const contentId = c.req.param("contentId");

	const list = await db.userList.findFirst({
		where: { id: listId, userId: user.id },
	});
	if (!list) return c.json({ error: "Not found" }, 404);

	await db.userListItem.delete({
		where: { listId_contentId: { listId, contentId } },
	});
	return c.json({ deleted: true });
});
