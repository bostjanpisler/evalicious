import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { recipe } from "./schemas/recipe";
import { blogPost } from "./schemas/blogPost";
import { travelEntry } from "./schemas/travelEntry";
import { product } from "./schemas/product";
import { course } from "./schemas/course";
import { chapter } from "./schemas/chapter";
import { lesson } from "./schemas/lesson";
import { homePage } from "./schemas/homePage";
import { aboutPage } from "./schemas/aboutPage";
import { youtube } from "./schemas/youtube";

export default defineConfig({
  name: "eva-licious",
  title: "Eva-Licious Studio",
  projectId: "o1l09q7i",
  dataset: process.env.SANITY_DATASET ?? "production",
  plugins: [structureTool()],
  schema: {
    types: [recipe, blogPost, travelEntry, product, course, chapter, lesson, homePage, aboutPage, youtube],
  },
});
