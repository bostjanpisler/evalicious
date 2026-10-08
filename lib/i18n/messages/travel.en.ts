import type { Shape } from "../translate";
import type { travelSl } from "./travel.sl";

export const travelEn: Shape<typeof travelSl> = {
	title: "Travel",
	subtitle: "Adventures and discoveries from all over the world.",
	empty: "No travel posts match your filters.",
	filters: {
		search: "Search travel posts",
		searchPlaceholder: "Search travel posts...",
		country: "Country:",
		tags: "Tags:",
		clear: "Clear filters",
	},
	meta: {
		descriptionFallback: "Discover {title} with Eva.",
	},
};
