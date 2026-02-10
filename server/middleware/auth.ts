import type { Context, Next } from "hono";
import { auth } from "../lib/auth.js";

export async function authMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	c.set("session", session?.session ?? null);
	c.set("user", session?.user ?? null);
	return next();
}
