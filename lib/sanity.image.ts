import type { SanityImageSource } from "@sanity/image-url";
import { createImageUrlBuilder } from "@sanity/image-url";

const builder = createImageUrlBuilder({
	projectId: "o1l09q7i",
	dataset: "production",
});

/** Absolute JPG URLs in the three crops Google asks for (1:1, 4:3, 16:9). */
export function structuredDataImages(source: SanityImageSource | undefined): string[] {
	if (!source) return [];
	const crops: [number, number][] = [
		[1200, 1200],
		[1200, 900],
		[1200, 675],
	];
	return crops.map(([width, height]) =>
		builder.image(source).width(width).height(height).fit("crop").format("jpg").url(),
	);
}

export function urlFor(source: SanityImageSource) {
	return builder.image(source);
}
