"use client";

import { useEffect } from "react";
import { useData } from "vike-react/useData";
import { fireCompletionConfetti } from "@/components/courses/StepCompletion";
import { ProgressTracker } from "@/components/courses/ProgressTracker";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import type { Data } from "./+data.server";

export default function CourseCompletePage() {
	const { courseTitle, courseSlug, totalSteps, completedSteps, recommendations } =
		useData<Data>();

	const allDone = completedSteps >= totalSteps;

	useEffect(() => {
		if (allDone) {
			fireCompletionConfetti();
		}
	}, [allDone]);

	return (
		<div className="mx-auto max-w-2xl py-12">
			{/* Congratulations / Almost there */}
			<div className="text-center">
				{allDone ? (
					<>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-10 w-10 text-green-600"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<h1 className="font-serif text-3xl font-bold">Čestitke!</h1>
						<p className="mt-3 text-lg text-muted-foreground">
							Uspešno si zaključil/a tečaj{" "}
							<strong>{courseTitle}</strong>!
						</p>
						<div className="mt-6 mx-auto max-w-xs">
							<ProgressTracker completed={completedSteps} total={totalSteps} />
						</div>
					</>
				) : (
					<>
						<h1 className="font-serif text-3xl font-bold">Skoraj!</h1>
						<p className="mt-3 text-lg text-muted-foreground">
							Zaključi vse korake tečaja <strong>{courseTitle}</strong>, da dobiš
							čestitke.
						</p>
						<div className="mt-6 mx-auto max-w-xs">
							<ProgressTracker completed={completedSteps} total={totalSteps} />
						</div>
						<a
							href={`/dashboard/my-courses/${courseSlug}`}
							className="mt-6 inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
						>
							Nadaljuj tečaj
						</a>
					</>
				)}
			</div>

			{/* Course recommendations */}
			{recommendations.length > 0 && (
				<div className="mt-14">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center">
							<span className="bg-background px-4 text-sm font-medium text-muted-foreground">
								Mogoče te zanima tudi
							</span>
						</div>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{recommendations.map((rec) => (
							<a
								key={rec._id}
								href={`/courses/${rec.slug}`}
								className="group rounded-xl border border-border overflow-hidden hover:border-amber-300 hover:shadow-md transition-all"
							>
								{rec.coverImage ? (
									<OptimizedImage
										image={rec.coverImage}
										alt={rec.title}
										width={400}
										height={220}
										className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="h-36 bg-gradient-to-br from-amber-100 to-amber-200" />
								)}
								<div className="p-4">
									<h3 className="font-serif font-semibold text-foreground group-hover:text-amber-700 transition-colors">
										{rec.title}
									</h3>
									{rec.description && (
										<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
											{rec.description}
										</p>
									)}
									<div className="mt-3 flex items-center justify-between">
										<span className="text-xs text-muted-foreground">
											{rec.stepCount}{" "}
											{rec.stepCount === 1
												? "korak"
												: rec.stepCount === 2
													? "koraka"
													: rec.stepCount <= 4
														? "koraki"
														: "korakov"}
										</span>
										<span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 group-hover:text-amber-700">
											Poglej
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3 w-3"
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
										</span>
									</div>
								</div>
							</a>
						))}
					</div>
				</div>
			)}

			{/* Back links */}
			<div className="mt-10 flex items-center justify-center gap-4">
				<a
					href="/dashboard/my-courses"
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					Moji tečaji
				</a>
				<a
					href="/courses"
					className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
				>
					Vsi tečaji
				</a>
			</div>
		</div>
	);
}
