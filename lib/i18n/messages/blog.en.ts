import type { Shape } from "../translate";
import type { blogSl } from "./blog.sl";

export const blogEn: Shape<typeof blogSl> = {
	title: "Blog",
	subtitle: "Thoughts, stories and tips from my kitchen and beyond.",
	empty: "No blog posts yet. Check back soon!",
	readingTime: "{minutes} min read",
	toc: "Table of contents",
	embed: {
		title: "Embedded content",
		youtube: "YouTube video",
	},
	meta: {
		descriptionFallback: "Read {title} on Eva-licious.",
	},
};
