import { urlFor } from "@/lib/sanity.image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface OptimizedImageProps {
	image: SanityImageSource;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	sizes?: string;
	priority?: boolean;
}

export function OptimizedImage({
	image,
	alt,
	width = 800,
	height,
	className,
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
	priority = false,
}: OptimizedImageProps) {
	const baseUrl = urlFor(image).auto("format").quality(80);

	const srcSet = [400, 600, 800, 1200, 1600]
		.map((w) => {
			const url = height
				? baseUrl.width(w).height(Math.round((w / width) * height)).url()
				: baseUrl.width(w).url();
			return `${url} ${w}w`;
		})
		.join(", ");

	const src = height
		? baseUrl.width(width).height(height).url()
		: baseUrl.width(width).url();

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
