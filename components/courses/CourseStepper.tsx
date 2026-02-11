import { cn } from "@/lib/utils";

interface Step {
	_id: string;
	slug: string;
	title: string;
}

interface CourseStepperProps {
	steps: Step[];
	progress: Record<string, boolean>;
	courseSlug: string;
	currentStepSlug: string;
	courseTitle: string;
	hideTitle?: boolean;
}

export function CourseStepper({
	steps,
	progress,
	courseSlug,
	currentStepSlug,
	courseTitle,
	hideTitle = false,
}: CourseStepperProps) {
	const completedCount = Object.values(progress).filter(Boolean).length;

	return (
		<div>
			{/* Course title + progress count */}
			{!hideTitle && (
				<div className="flex items-center justify-between mb-3">
					<a
						href={`/dashboard/my-courses/${courseSlug}`}
						className="text-sm text-gray-500 hover:text-gray-700 transition-colors truncate"
					>
						{courseTitle}
					</a>
					<span className="text-xs text-gray-400 flex-shrink-0 ml-4">
						{completedCount}/{steps.length} opravljeno
					</span>
				</div>
			)}
			{hideTitle && (
				<div className="flex items-center justify-end mb-3">
					<span className="text-xs text-gray-400">
						{completedCount}/{steps.length} opravljeno
					</span>
				</div>
			)}

			{/* Stepper: circles connected by lines */}
			<nav className="flex items-center">
				{steps.map((step, index) => {
					const isCompleted = progress[step._id] === true;
					const isActive = currentStepSlug === step.slug;
					const isLast = index === steps.length - 1;

					return (
						<div
							key={step._id}
							className={cn(
								"flex items-center",
								!isLast && "flex-1",
							)}
						>
							{/* Circle */}
							<a
								href={`/dashboard/my-courses/${courseSlug}/${step.slug}`}
								title={step.title}
								className={cn(
									"relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all",
									isActive &&
										"bg-amber-500 text-white ring-2 ring-amber-200 ring-offset-2",
									isCompleted &&
										!isActive &&
										"bg-green-500 text-white",
									!isCompleted &&
										!isActive &&
										"border-2 border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500",
								)}
							>
								{isCompleted && !isActive ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									index + 1
								)}
							</a>

							{/* Connecting line */}
							{!isLast && (
								<div className="mx-1 h-0.5 flex-1 rounded-full">
									<div
										className={cn(
											"h-full rounded-full",
											isCompleted
												? "bg-green-400"
												: "bg-gray-200",
										)}
									/>
								</div>
							)}
						</div>
					);
				})}
			</nav>

			{/* Current step title — only in lesson view */}
			{!hideTitle && (
				<p className="mt-2 text-sm font-medium text-gray-700 truncate">
					{steps.find((s) => s.slug === currentStepSlug)?.title}
				</p>
			)}
		</div>
	);
}
