import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

export default {
	extends: vikeReact,
	passToClient: ["user", "routeParams"],
	lang: "sl",
	title: "Eva-licious",
	description:
		"Okusne jedi na rastlinski osnovi, knjižice z recepti, kuharski tečaji in delavnice ter raziskovanje sveta z Evo.",
	favicon: "/favicon.svg",
} satisfies Config;
