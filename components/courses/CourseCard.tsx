import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface CourseCardProps {
	title: string;
	description: string;
	progress?: number;
	href?: string;
	coverImage?: unknown;
	stepCount?: number;
}

export function CourseCard({
	title,
	description,
	progress,
	href,
	coverImage,
	stepCount,
}: CourseCardProps) {
	const content = (
		<div className="rounded-lg border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-sm transition-all">
			{coverImage && (
				<OptimizedImage
					image={coverImage}
					alt={title}
					width={600}
					height={340}
					className="w-full h-48 object-cover"
				/>
			)}
			<div className="p-6">
				<h3 className="font-serif text-lg font-semibold mb-2">{title}</h3>
				<p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

				{stepCount !== undefined && (
					<p className="text-xs text-muted-foreground mb-3">
						{stepCount} {stepCount === 1 ? "korak" : stepCount === 2 ? "koraka" : stepCount <= 4 ? "koraki" : "korakov"}
					</p>
				)}

				{progress !== undefined && (
					<div>
						<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
							<span>Napredek</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
							<div
								className="h-full rounded-full bg-amber-500 transition-all"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	if (href) {
		return <a href={href}>{content}</a>;
	}

	return content;
}
