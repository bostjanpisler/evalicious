import { useData } from "vike-react/useData";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { ResetProgress } from "@/components/courses/ResetProgress";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Data } from "./+data.server";

export default function CourseViewPage() {
	const { course, progress } = useData<Data>();

	const completedCount = Object.values(progress).filter(Boolean).length;
	const totalSteps = course.steps.length;
	const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
	const firstIncomplete = course.steps.find((s) => !progress[s._id]);
	const allDone = completedCount === totalSteps && totalSteps > 0;
	const totalDuration = course.steps.reduce(
		(sum, step) => sum + (step.durationMinutes ?? 0),
		0,
	);

	return (
		<div>
			{/* Hero — matching public course page style */}
			<div className="relative overflow-hidden rounded-2xl bg-gray-900 mb-10">
				{course.coverImage ? (
					<OptimizedImage
						image={course.coverImage}
						alt={course.title}
						width={1200}
						height={400}
						className="w-full h-56 sm:h-64 lg:h-72 object-cover opacity-60"
					/>
				) : (
					<div className="h-56 sm:h-64 lg:h-72 bg-gradient-to-br from-amber-800 to-amber-950" />
				)}

				<div className="absolute inset-0 flex items-end">
					<div className="w-full bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent p-6 sm:p-8">
						{/* Title + reset */}
						<div className="flex items-start justify-between gap-4">
							<h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
								{course.title}
							</h2>
							{completedCount > 0 && (
								<div className="flex-shrink-0">
									<ResetProgress courseId={course._id} dark />
								</div>
							)}
						</div>

						{/* Stats row — matching public page */}
						<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300">
							<span className="flex items-center gap-1.5">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
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
								{totalSteps}{" "}
								{totalSteps === 1
									? "korak"
									: totalSteps === 2
										? "koraka"
										: totalSteps <= 4
											? "koraki"
											: "korakov"}
							</span>
							{totalDuration > 0 && (
								<span className="flex items-center gap-1.5">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
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

						{/* Progress bar */}
						<div className="mt-4">
							<div className="flex items-center justify-between text-sm text-gray-300 mb-2">
								<span>
									{allDone
										? "Vse opravljeno!"
										: `${completedCount} od ${totalSteps} opravljeno`}
								</span>
								<span className="font-medium text-white">
									{percentage}%
								</span>
							</div>
							<div className="h-2 rounded-full bg-white/20 overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full transition-all duration-500",
										allDone ? "bg-green-400" : "bg-amber-400",
									)}
									style={{ width: `${percentage}%` }}
								/>
							</div>
						</div>

						{/* CTA */}
						<div className="mt-5">
							{allDone ? (
								<a
									href={`/dashboard/my-courses/${course.slug}/complete`}
									className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
								>
									Ogled zaključka
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							) : totalSteps > 0 ? (
								<a
									href={`/dashboard/my-courses/${course.slug}/${(firstIncomplete ?? course.steps[0]).slug}`}
									className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
								>
									{completedCount > 0 ? "Nadaljuj" : "Začni tečaj"}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</a>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{/* Step list — matching public page card style */}
			{totalSteps > 0 ? (
				<div>
					<h2 className="font-serif text-2xl font-bold mb-6">
						Vsebina ({totalSteps}{" "}
						{totalSteps === 1
							? "korak"
							: totalSteps === 2
								? "koraka"
								: totalSteps <= 4
									? "koraki"
									: "korakov"})
					</h2>
					<div className="space-y-2">
						{course.steps.map((step, index) => {
							const isCompleted = progress[step._id] === true;
							const isNext =
								!isCompleted && firstIncomplete?._id === step._id;

							return (
								<a
									key={step._id}
									href={`/dashboard/my-courses/${course.slug}/${step.slug}`}
									className={cn(
										"flex items-start gap-4 rounded-xl border p-4 transition-all group",
										isNext
											? "border-amber-300 bg-amber-50/50 shadow-sm"
											: isCompleted
												? "border-green-200 bg-green-50/30"
												: "border-border hover:border-border hover:shadow-sm",
									)}
								>
									{/* Step indicator */}
									{isCompleted ? (
										<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
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
										</span>
									) : isNext ? (
										<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold ring-2 ring-amber-200 ring-offset-2">
											{index + 1}
										</span>
									) : (
										<span
											className={cn(
												"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
												index === 0 && !allDone && !firstIncomplete
													? "bg-amber-500 text-white"
													: "border-2 border-gray-300 text-gray-400",
											)}
										>
											{index + 1}
										</span>
									)}

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h3
												className={cn(
													"font-medium",
													isCompleted
														? "text-green-800"
														: isNext
															? "text-amber-900"
															: "text-foreground",
												)}
											>
												{step.title}
											</h3>
											{isNext && (
												<span className="hidden sm:inline-block text-xs font-medium text-amber-600 bg-amber-100 rounded-full px-2.5 py-0.5">
													Naslednji
												</span>
											)}
											{isCompleted && (
												<span className="hidden sm:inline-block text-xs font-medium text-green-600 bg-green-100 rounded-full px-2.5 py-0.5">
													Opravljeno
												</span>
											)}
										</div>
										{step.description && (
											<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
												{step.description}
											</p>
										)}
									</div>

									{/* Duration + arrow */}
									<div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
										{step.durationMinutes != null &&
											step.durationMinutes > 0 && (
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<svg
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
													{step.durationMinutes} min
												</span>
											)}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</a>
							);
						})}
					</div>
				</div>
			) : (
				<p className="text-muted-foreground py-12 text-center">
					Ta tečaj nima korakov.
				</p>
			)}
		</div>
	);
}
