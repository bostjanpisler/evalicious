import type { Context, Next } from "hono";
import { auth } from "../lib/auth.js";

export async function requireAuth(c: Context, next: Next) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("session", session.session);
	c.set("user", session.user);
	return next();
}

export async function requireAdmin(c: Context, next: Next) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user || session.user.role !== "admin") {
		return c.json({ error: "Forbidden" }, 403);
	}

	c.set("session", session.session);
	c.set("user", session.user);
	return next();
}
