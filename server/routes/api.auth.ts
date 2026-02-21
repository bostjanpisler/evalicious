import { Hono } from "hono";
import { auth } from "../lib/auth.js";

export const authHandler = new Hono();

authHandler.all("/*", async (c) => {
	const response = await auth.handler(c.req.raw);
	response.headers.set(
		"Cache-Control",
		"no-store, no-cache, must-revalidate",
	);
	response.headers.set("Pragma", "no-cache");
	return response;
});
