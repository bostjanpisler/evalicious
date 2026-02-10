import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "o1l09q7i",
    dataset: process.env.SANITY_DATASET ?? "production",
  },
});
