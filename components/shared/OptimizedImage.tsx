import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/lib/sanity.image";

interface OptimizedImageProps {
	image: SanityImageSource;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	sizes?: string;
	priority?: boolean;
	/** Sanity CDN output quality (1-100). Raise selectively for detail imagery. */
	quality?: number;
}

export function OptimizedImage({
	image,
	alt,
	width = 800,
	height,
	className,
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
	priority = false,
	quality = 80,
}: OptimizedImageProps) {
	const baseUrl = urlFor(image).auto("format").quality(quality);

	const srcSet = [400, 600, 800, 1200, 1600, 1800]
		.map((w) => {
			const url = height
				? baseUrl
						.width(w)
						.height(Math.round((w / width) * height))
						.url()
				: baseUrl.width(w).url();
			return `${url} ${w}w`;
		})
		.join(", ");

	const src = height ? baseUrl.width(width).height(height).url() : baseUrl.width(width).url();

	const lqip = urlFor(image).width(20).quality(20).blur(50).auto("format").url();

	return (
		<img
			src={src}
			srcSet={srcSet}
			sizes={sizes}
			alt={alt}
			width={width}
			height={height}
			className={className}
			loading={priority ? "eager" : "lazy"}
			decoding={priority ? "sync" : "async"}
			style={{
				backgroundImage: `url(${lqip})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
			}}
		/>
	);
}
