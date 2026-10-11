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

interface SanityImageObject {
	asset?: { _ref?: string };
	crop?: unknown;
	hotspot?: unknown;
}

/**
 * Square avatar URL for a portrait photo. A crop or hotspot set in Studio wins;
 * without one, frame head and shoulders near the top of the picture instead of
 * the centre square (which shows the torso and leaves the face tiny).
 */
export function portraitAvatarUrl(source: SanityImageSource, size: number): string {
	const base = urlFor(source).width(size).height(size).fit("crop").auto("format");
	const image = source as SanityImageObject;
	const dims = image.asset?._ref?.match(/-(\d+)x(\d+)-\w+$/);
	if (image.crop || image.hotspot || !dims) return base.url();
	const width = Number(dims[1]);
	const height = Number(dims[2]);
	if (height <= width) return base.url();
	const side = Math.round(width * 0.55);
	const left = Math.round((width - side) / 2);
	const top = Math.max(0, Math.round(height * 0.21 - side / 2));
	return base.rect(left, top, side, side).url();
}
