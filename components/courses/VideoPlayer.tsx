interface VideoPlayerProps {
	embedUrl?: string;
	title?: string;
}

export function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
	if (!embedUrl) {
		return (
			<div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
				<p className="text-gray-400">Video ni na voljo</p>
			</div>
		);
	}

	return (
		<div className="aspect-video rounded-lg overflow-hidden bg-black">
			<iframe
				src={embedUrl}
				title={title ?? "Video"}
				className="w-full h-full"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
				allowFullScreen
			/>
		</div>
	);
}
