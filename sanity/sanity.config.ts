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
import { htmlEmbed } from "./schemas/htmlEmbed";
import { recommendedProduct } from "./schemas/recommendedProduct";
import { createEnglishVersion } from "./actions/createEnglishVersion";

const TRANSLATED_TYPES = ["recipe", "blogPost", "travelEntry"];

const SL = "coalesce(language, 'sl') == 'sl'";
const EN = "language == 'en'";

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
							.title("Recepti (SL)")
							.schemaType("recipe")
							.child(
								S.documentList()
									.title("Recepti (SL)")
									.schemaType("recipe")
									.filter('_type == "recipe" && ' + SL)
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Recipes (EN)")
							.schemaType("recipe")
							.child(
								S.documentList()
									.title("Recipes (EN)")
									.schemaType("recipe")
									.filter('_type == "recipe" && ' + EN)
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Potovanja (SL)")
							.schemaType("travelEntry")
							.child(
								S.documentList()
									.title("Potovanja (SL)")
									.schemaType("travelEntry")
									.filter('_type == "travelEntry" && ' + SL)
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Travel (EN)")
							.schemaType("travelEntry")
							.child(
								S.documentList()
									.title("Travel (EN)")
									.schemaType("travelEntry")
									.filter('_type == "travelEntry" && ' + EN)
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Blog (SL)")
							.schemaType("blogPost")
							.child(
								S.documentList()
									.title("Blog (SL)")
									.schemaType("blogPost")
									.filter('_type == "blogPost" && ' + SL)
									.defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
							),
						S.listItem()
							.title("Blog (EN)")
							.schemaType("blogPost")
							.child(
								S.documentList()
									.title("Blog (EN)")
									.schemaType("blogPost")
									.filter('_type == "blogPost" && ' + EN)
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
							.title("Domača stran (SL)")
							.schemaType("homePage")
							.child(S.document().schemaType("homePage").documentId("homePage")),
						S.listItem()
							.title("Home page (EN)")
							.schemaType("homePage")
							.child(S.document().schemaType("homePage").documentId("homePage-en")),
						S.listItem()
							.title("O meni (SL)")
							.schemaType("aboutPage")
							.child(S.document().schemaType("aboutPage").documentId("aboutPage")),
						S.listItem()
							.title("About me (EN)")
							.schemaType("aboutPage")
							.child(S.document().schemaType("aboutPage").documentId("aboutPage-en")),
					]),
		}),
	],
	document: {
		actions: (prev, context) =>
			TRANSLATED_TYPES.includes(context.schemaType) ? [...prev, createEnglishVersion] : prev,
	},
	schema: {
		types: [recipe, blogPost, travelEntry, product, course, lesson, homePage, aboutPage, youtube, htmlEmbed, recommendedProduct],
	},
});
