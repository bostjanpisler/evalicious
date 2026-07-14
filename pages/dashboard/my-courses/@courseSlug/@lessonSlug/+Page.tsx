import { useData } from "vike-react/useData";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { CourseStepper } from "@/components/courses/CourseStepper";
import { NextStepLink } from "@/components/courses/NextStepLink";
import { PdfViewer } from "@/components/courses/PdfViewer";
import { StepCompletion } from "@/components/courses/StepCompletion";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { IngredientChecklist } from "@/components/recipes/IngredientChecklist";
import { StepChecklist } from "@/components/recipes/StepChecklist";
import { formatDuration } from "@/lib/utils";
import type { Data } from "./+data.server";

type StepRecipe = NonNullable<Data["step"]["recipe"]>;

function RecipeContent({ recipe }: { recipe: StepRecipe }) {
	return (
		<>
			<div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
				{recipe.prepTime != null && recipe.prepTime > 0 && (
					<span>Priprava: {formatDuration(recipe.prepTime)}</span>
				)}
				{recipe.cookTime != null && recipe.cookTime > 0 && (
					<span>Kuhanje: {formatDuration(recipe.cookTime)}</span>
				)}
				{recipe.servings != null && (
					<span>
						{recipe.servings} {recipe.servings === 1 ? "porcija" : "porcij"}
					</span>
				)}
			</div>

			{recipe.ingredientGroups && recipe.ingredientGroups.length > 0 && (
				<>
					<h4 className="mt-6 mb-3 font-serif text-lg font-semibold">Sestavine</h4>
					<IngredientChecklist groups={recipe.ingredientGroups} />
				</>
			)}

			{recipe.stepGroups && recipe.stepGroups.length > 0 && (
				<>
					<h4 className="mt-6 mb-3 font-serif text-lg font-semibold">Navodila</h4>
					<StepChecklist groups={recipe.stepGroups} />
				</>
			)}
		</>
	);
}

export default function LessonViewPage() {
	const { courseTitle, courseSlug, step, steps, progress, prevStep, nextStep } = useData<Data>();

	return (
		<div>
			{/* Step progress stepper */}
			<div className="mb-6">
				<CourseStepper
					steps={steps}
					progress={progress}
					courseSlug={courseSlug}
					currentStepSlug={step.slug}
					courseTitle={courseTitle}
				/>
			</div>

			{/* Main content — key forces remount on step change */}
			<div key={step._id}>
				{/* Two-column: video+content left, recipe right (sticky) */}
				<div className={step.recipe ? "lg:flex lg:gap-8" : ""}>
					{/* Left column — video, description, text content */}
					<div className={step.recipe ? "lg:flex-1 lg:min-w-0" : ""}>
						{/* Video */}
						<VideoPlayer embedUrl={step.embedUrl} title={step.title} />

						{/* Step header */}
						<div className="mt-6">
							<h2 className="font-serif text-2xl font-bold">{step.title}</h2>
							{step.description && <p className="mt-2 text-muted-foreground">{step.description}</p>}
						</div>

						{/* PDF download */}
						{step.pdfUrl && (
							<div className="mt-6">
								<PdfViewer url={step.pdfUrl} title={`${step.title} — PDF`} />
							</div>
						)}

						{/* Portable text content */}
						{step.content && step.content.length > 0 && (
							<div className="mt-8">
								<PortableTextRenderer value={step.content} />
							</div>
						)}
					</div>

					{/* Right column — recipe (collapsible on mobile, sticky on desktop) */}
					{step.recipe && (
						<div className="mt-8 lg:mt-0 lg:w-96 lg:flex-shrink-0">
							{/* Mobile: collapsible */}
							<details className="rounded-xl border border-border bg-card lg:hidden">
								<summary className="cursor-pointer p-6 font-serif text-xl font-bold">
									{step.recipe.title}
									<span className="ml-2 text-sm font-normal text-muted-foreground">(recept)</span>
								</summary>
								<div className="px-6 pb-6">
									<RecipeContent recipe={step.recipe} />
								</div>
							</details>

							{/* Desktop: always visible + sticky */}
							<div className="hidden lg:block lg:sticky lg:top-4 rounded-xl border border-border bg-card p-6">
								<h3 className="font-serif text-xl font-bold">{step.recipe.title}</h3>
								<RecipeContent recipe={step.recipe} />
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Sticky bottom navigation bar */}
			<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
				<div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
					{prevStep ? (
						<a
							href={`/dashboard/my-courses/${courseSlug}/${prevStep.slug}`}
							className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
							</svg>
							<span className="hidden sm:inline">{prevStep.title}</span>
							<span className="sm:hidden">Nazaj</span>
						</a>
					) : (
						<span />
					)}

					<StepCompletion
						lessonId={step._id}
						initialCompleted={progress[step._id] ?? false}
						compact
					/>

					{nextStep ? (
						<NextStepLink
							href={`/dashboard/my-courses/${courseSlug}/${nextStep.slug}`}
							lessonId={step._id}
							className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
						>
							<span className="hidden sm:inline">{nextStep.title}</span>
							<span className="sm:hidden">Naprej</span>
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</NextStepLink>
					) : (
						<NextStepLink
							href={`/dashboard/my-courses/${courseSlug}/complete`}
							lessonId={step._id}
							className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
						>
							Zaključi
							<svg
								aria-hidden="true"
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
						</NextStepLink>
					)}
				</div>
			</div>

			{/* Bottom padding so content isn't hidden behind sticky bar */}
			<div className="h-20" />
		</div>
	);
}
