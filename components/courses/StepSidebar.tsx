import { cn } from "@/lib/utils";

interface Step {
	_id: string;
	slug: string;
	title: string;
}

interface StepSidebarProps {
	steps: Step[];
	progress: Record<string, boolean>;
	courseSlug: string;
	currentStepSlug?: string;
	layout?: "vertical" | "horizontal";
}

export function StepSidebar({
	steps,
	progress,
	courseSlug,
	currentStepSlug,
	layout = "vertical",
}: StepSidebarProps) {
	if (layout === "horizontal") {
		return (
			<nav className="flex items-center gap-1 overflow-x-auto pb-1">
				{steps.map((step, index) => {
					const isCompleted = progress[step._id] === true;
					const isActive = currentStepSlug === step.slug;

					return (
						<a
							key={step._id}
							href={`/dashboard/my-courses/${courseSlug}/${step.slug}`}
							className={cn(
								"flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors",
								isActive
									? "bg-amber-100 text-amber-900 font-medium"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							{isCompleted ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 text-green-500 flex-shrink-0"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							) : (
								<span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 flex-shrink-0 text-[10px] font-medium text-gray-400">
									{index + 1}
								</span>
							)}
							{step.title}
						</a>
					);
				})}
			</nav>
		);
	}

	return (
		<nav className="space-y-1">
			{steps.map((step, index) => {
				const isCompleted = progress[step._id] === true;
				const isActive = currentStepSlug === step.slug;

				return (
					<a
						key={step._id}
						href={`/dashboard/my-courses/${courseSlug}/${step.slug}`}
						className={cn(
							"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
							isActive
								? "bg-amber-50 text-amber-900 font-medium"
								: "text-muted-foreground hover:bg-accent hover:text-foreground",
						)}
					>
						{isCompleted ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 text-green-500 flex-shrink-0"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						) : (
							<span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 flex-shrink-0 text-[10px] font-medium text-gray-400">
								{index + 1}
							</span>
						)}
						<span className="truncate">{step.title}</span>
					</a>
				);
			})}
		</nav>
	);
}
