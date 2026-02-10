import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = createImageUrlBuilder({
	projectId: import.meta.env.PUBLIC_ENV__SANITY_PROJECT_ID ?? "",
	dataset: import.meta.env.PUBLIC_ENV__SANITY_DATASET ?? "production",
});

export function urlFor(source: SanityImageSource) {
	return builder.image(source);
}
