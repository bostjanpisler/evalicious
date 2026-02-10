interface VideoPlayerProps {
	url?: string;
	title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
	if (!url) {
		return (
			<div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
				<p className="text-gray-400">No video available</p>
			</div>
		);
	}

	return (
		<div className="aspect-video rounded-lg overflow-hidden bg-black">
			<video
				src={url}
				controls
				className="w-full h-full"
				title={title}
			>
				<track kind="captions" />
				Your browser does not support the video element.
			</video>
		</div>
	);
}
