import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface CourseCardProps {
	title: string;
	description: string;
	progress?: number;
	href?: string;
	coverImage?: unknown;
	stepCount?: number;
	completed?: boolean;
}

export function CourseCard({
	title,
	description,
	progress,
	href,
	coverImage,
	stepCount,
	completed = false,
}: CourseCardProps) {
	const content = (
		<div className="rounded-lg border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-sm transition-all">
			<div className="relative">
				{coverImage && (
					<OptimizedImage
						image={coverImage}
						alt={title}
						width={600}
						height={340}
						className="w-full h-48 object-cover"
					/>
				)}
				{completed && (
					<span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
						Zaključeno
					</span>
				)}
			</div>
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
							<span>{completed ? "Opravljeno" : "Napredek"}</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
							<div
								className={`h-full rounded-full transition-all ${completed ? "bg-green-500" : "bg-amber-500"}`}
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
