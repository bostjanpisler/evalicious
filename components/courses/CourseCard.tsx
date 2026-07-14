import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatDuration } from "@/lib/utils";

interface CourseCardProps {
	title: string;
	description: string;
	progress?: number;
	href?: string;
	coverImage?: unknown;
	stepCount?: number;
	totalDuration?: number;
	completed?: boolean;
}

export function CourseCard({
	title,
	description,
	progress,
	href,
	coverImage,
	stepCount,
	totalDuration,
	completed = false,
}: CourseCardProps) {
	const isPublic = progress === undefined;

	const content = (
		<div className="group rounded-xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all">
			<div className="relative">
				{coverImage ? (
					<OptimizedImage
						image={coverImage}
						alt={title}
						width={600}
						height={340}
						className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				) : (
					<div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200" />
				)}
				{/* Video delavnica badge — public cards only */}
				{isPublic && (
					<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						Video delavnica
					</span>
				)}
				{/* Completed badge — dashboard cards */}
				{completed && (
					<span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
						<svg
							aria-hidden="true"
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
			<div className="p-5">
				<h3 className="font-serif text-lg font-semibold mb-1.5">{title}</h3>
				<p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

				{/* Meta row — step count + duration */}
				{(stepCount !== undefined || (totalDuration != null && totalDuration > 0)) && (
					<div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
						{stepCount !== undefined && (
							<span className="flex items-center gap-1">
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									className="h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								{stepCount}{" "}
								{stepCount === 1
									? "korak"
									: stepCount === 2
										? "koraka"
										: stepCount <= 4
											? "koraki"
											: "korakov"}
							</span>
						)}
						{totalDuration != null && totalDuration > 0 && (
							<span className="flex items-center gap-1">
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									className="h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{formatDuration(totalDuration)}
							</span>
						)}
					</div>
				)}

				{/* Progress bar — dashboard cards */}
				{progress !== undefined && (
					<div className="mb-4">
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

				{/* CTA — public cards get a button, dashboard cards rely on the card being a link */}
				{isPublic ? (
					<span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700 group-hover:bg-amber-100 transition-colors">
						Poglej delavnico
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</span>
				) : (
					<span className="text-xs font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
						{completed ? "Ponovi delavnico" : progress && progress > 0 ? "Nadaljuj" : "Začni"} →
					</span>
				)}
			</div>
		</div>
	);

	if (href) {
		return <a href={href}>{content}</a>;
	}

	return content;
}
