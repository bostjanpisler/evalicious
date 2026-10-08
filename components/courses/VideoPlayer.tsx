import { useI18n } from "@/lib/i18n/react";

interface VideoPlayerProps {
	embedUrl?: string;
	title?: string;
}

export function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
	const { t } = useI18n();

	if (!embedUrl) {
		return (
			<div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
				<p className="text-gray-400">{t("courses.video.unavailable")}</p>
			</div>
		);
	}

	return (
		<div className="aspect-video rounded-lg overflow-hidden bg-black">
			<iframe
				src={embedUrl}
				title={title ?? t("courses.video.fallbackTitle")}
				className="w-full h-full"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
				allowFullScreen
			/>
		</div>
	);
}
