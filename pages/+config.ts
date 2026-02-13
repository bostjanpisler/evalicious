import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

export default {
	extends: vikeReact,
	passToClient: ["user", "routeParams"],
	lang: "sl",
	title: "Eva-Licious",
	description: "Okusni recepti iz Evine kuhinje.",
	favicon: "/favicon.svg",
} satisfies Config;
