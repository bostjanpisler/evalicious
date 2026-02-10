interface CourseCardProps {
	title: string;
	description: string;
	progress?: number;
	href?: string;
}

export function CourseCard({
	title,
	description,
	progress,
	href,
}: CourseCardProps) {
	const content = (
		<div className="rounded-lg border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
			<h3 className="font-serif text-lg font-semibold mb-2">{title}</h3>
			<p className="text-sm text-gray-600 mb-4 line-clamp-2">
				{description}
			</p>

			{progress !== undefined && (
				<div>
					<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
						<span>Progress</span>
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
	);

	if (href) {
		return <a href={href}>{content}</a>;
	}

	return content;
}
