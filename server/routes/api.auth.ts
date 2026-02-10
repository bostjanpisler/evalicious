import { Hono } from "hono";
import { auth } from "../lib/auth.js";

export const authHandler = new Hono();

authHandler.all("/*", (c) => {
	return auth.handler(c.req.raw);
});
