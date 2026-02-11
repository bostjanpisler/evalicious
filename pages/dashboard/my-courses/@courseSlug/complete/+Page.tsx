"use client";

import { useEffect } from "react";
import { useData } from "vike-react/useData";
import { fireCompletionConfetti } from "@/components/courses/StepCompletion";
import { ProgressTracker } from "@/components/courses/ProgressTracker";
import type { Data } from "./+data.server";

export default function CourseCompletePage() {
	const { courseTitle, courseSlug, totalSteps, completedSteps } =
		useData<Data>();

	const allDone = completedSteps >= totalSteps;

	useEffect(() => {
		if (allDone) {
			fireCompletionConfetti();
		}
	}, [allDone]);

	return (
		<div className="mx-auto max-w-lg py-16 text-center">
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

			<div className="mt-8 flex items-center justify-center gap-4">
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
					Razišči več tečajev
				</a>
			</div>
		</div>
	);
}
