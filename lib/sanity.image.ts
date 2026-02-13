import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = createImageUrlBuilder({
	projectId: "o1l09q7i",
	dataset: "production",
});

export function urlFor(source: SanityImageSource) {
	return builder.image(source);
}
