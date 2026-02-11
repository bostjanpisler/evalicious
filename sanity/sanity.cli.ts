import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "o1l09q7i",
    dataset: process.env.SANITY_DATASET ?? "production",
  },
  deployment: {
    appId: "nv58fko1j8qsugcs60f108op",
  },
});
