import { useData } from "vike-react/useData";
import { StepSidebar } from "@/components/courses/StepSidebar";
import { ProgressTracker } from "@/components/courses/ProgressTracker";
import type { Data } from "./+data.server";

export default function CourseViewPage() {
	const { course, progress } = useData<Data>();

	const completedCount = Object.values(progress).filter(Boolean).length;
	const firstIncomplete = course.steps.find((s) => !progress[s._id]);
	const targetStep = firstIncomplete ?? course.steps[0];

	return (
		<div className="lg:flex lg:gap-8">
			{/* Step sidebar */}
			<aside className="lg:w-64 lg:flex-shrink-0 mb-6 lg:mb-0">
				<div className="rounded-lg border border-gray-200 p-4">
					<h3 className="font-serif text-lg font-semibold mb-4">
						{course.title}
					</h3>
					<div className="mb-4">
						<ProgressTracker
							completed={completedCount}
							total={course.steps.length}
						/>
					</div>
					<StepSidebar
						steps={course.steps}
						progress={progress}
						courseSlug={course.slug}
					/>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex-1 min-w-0">
				{targetStep ? (
					<div className="text-center py-12">
						<h2 className="font-serif text-2xl font-bold mb-4">
							{course.title}
						</h2>
						<p className="text-gray-500 mb-6">
							Izberi korak iz stranske vrstice ali nadaljuj s spodnjim gumbom.
						</p>
						<a
							href={`/dashboard/my-courses/${course.slug}/${targetStep.slug}`}
							className="inline-flex items-center rounded-lg bg-amber-600 px-6 py-3 text-base font-medium text-white hover:bg-amber-700 transition-colors"
						>
							{firstIncomplete ? "Nadaljuj tečaj" : "Začni tečaj"}
						</a>
					</div>
				) : (
					<p className="text-gray-500 py-12 text-center">
						Ta tečaj nima korakov.
					</p>
				)}
			</div>
		</div>
	);
}
