import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { recipe } from "./schemas/recipe";
import { blogPost } from "./schemas/blogPost";
import { travelEntry } from "./schemas/travelEntry";
import { product } from "./schemas/product";
import { course } from "./schemas/course";
import { lesson } from "./schemas/lesson";
import { homePage } from "./schemas/homePage";
import { aboutPage } from "./schemas/aboutPage";
import { youtube } from "./schemas/youtube";

export default defineConfig({
	name: "eva-licious",
	title: "Eva-licious Studio",
	projectId: "o1l09q7i",
	dataset: process.env.SANITY_DATASET ?? "production",
	plugins: [
		structureTool({
			structure: (S) =>
				S.list()
					.title("Vsebina")
					.items([
						S.listItem()
							.title("Recepti")
							.schemaType("recipe")
							.child(
								S.documentTypeList("recipe")
									.title("Recepti")
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Potovanja")
							.schemaType("travelEntry")
							.child(
								S.documentTypeList("travelEntry")
									.title("Potovanja")
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Blog")
							.schemaType("blogPost")
							.child(
								S.documentTypeList("blogPost")
									.title("Blog")
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.divider(),
						S.listItem()
							.title("Izdelki")
							.schemaType("product")
							.child(
								S.documentTypeList("product")
									.title("Izdelki")
									.defaultOrdering([{ field: "_createdAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Tečaji")
							.schemaType("course")
							.child(S.documentTypeList("course").title("Tečaji")),
						S.listItem()
							.title("Koraki")
							.schemaType("lesson")
							.child(S.documentTypeList("lesson").title("Koraki")),
						S.divider(),
						S.listItem()
							.title("Domača stran")
							.schemaType("homePage")
							.child(S.document().schemaType("homePage").documentId("homePage")),
						S.listItem()
							.title("O meni")
							.schemaType("aboutPage")
							.child(S.document().schemaType("aboutPage").documentId("aboutPage")),
					]),
		}),
	],
	schema: {
		types: [recipe, blogPost, travelEntry, product, course, lesson, homePage, aboutPage, youtube],
	},
});
