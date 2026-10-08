import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

export default {
	extends: vikeReact,
	passToClient: ["user", "routeParams", "locale"],
	title: "Eva-licious",
	favicon: "/favicon.svg",
} satisfies Config;
