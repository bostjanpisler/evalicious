import { useData } from "vike-react/useData";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { PdfViewer } from "@/components/courses/PdfViewer";
import { StepCompletion } from "@/components/courses/StepCompletion";
import { StepSidebar } from "@/components/courses/StepSidebar";
import { ProgressTracker } from "@/components/courses/ProgressTracker";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import type { Data } from "./+data.server";

export default function LessonViewPage() {
	const { courseTitle, courseSlug, step, steps, progress, prevStep, nextStep } =
		useData<Data>();

	const completedCount = Object.values(progress).filter(Boolean).length;

	return (
		<div className="lg:flex lg:gap-8">
			{/* Step sidebar */}
			<aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
				<div className="sticky top-24 rounded-lg border border-gray-200 p-4">
					<h3 className="font-serif text-sm font-semibold mb-3 truncate">
						{courseTitle}
					</h3>
					<div className="mb-3">
						<ProgressTracker
							completed={completedCount}
							total={steps.length}
						/>
					</div>
					<StepSidebar
						steps={steps}
						progress={progress}
						courseSlug={courseSlug}
						currentStepSlug={step.slug}
					/>
				</div>
			</aside>

			{/* Main content — key forces remount on step change */}
			<div key={step._id} className="flex-1 min-w-0">
				{/* Video */}
				<VideoPlayer embedUrl={step.embedUrl} title={step.title} />

				{/* Step header */}
				<div className="mt-6">
					<h2 className="font-serif text-2xl font-bold">{step.title}</h2>
					{step.description && (
						<p className="mt-2 text-muted-foreground">{step.description}</p>
					)}
				</div>

				{/* Completion + PDF row */}
				<div className="mt-6 flex flex-wrap items-center gap-4">
					<StepCompletion
						lessonId={step._id}
						initialCompleted={progress[step._id] ?? false}
					/>
					{step.pdfUrl && (
						<PdfViewer url={step.pdfUrl} title={`${step.title} — PDF`} />
					)}
				</div>

				{/* Portable text content */}
				{step.content && step.content.length > 0 && (
					<div className="mt-8">
						<PortableTextRenderer value={step.content} />
					</div>
				)}

				{/* Navigation */}
				<div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
					{prevStep ? (
						<a
							href={`/dashboard/my-courses/${courseSlug}/${prevStep.slug}`}
							className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
						>
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
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							{prevStep.title}
						</a>
					) : (
						<span />
					)}

					{nextStep ? (
						<a
							href={`/dashboard/my-courses/${courseSlug}/${nextStep.slug}`}
							className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
						>
							{nextStep.title}
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
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					) : (
						<a
							href={`/dashboard/my-courses/${courseSlug}/complete`}
							className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
						>
							Zaključi
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
					)}
				</div>
			</div>
		</div>
	);
}
