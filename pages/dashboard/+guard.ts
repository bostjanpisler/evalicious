import type { GuardAsync } from "vike/types";
import { render, redirect } from "vike/abort";

export const guard: GuardAsync = async (pageContext) => {
	const user = (pageContext as Record<string, unknown>).user;
	if (!user) {
		throw redirect("/login");
	}
};
