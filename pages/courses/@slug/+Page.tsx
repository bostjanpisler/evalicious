import { useData } from "vike-react/useData";
import { useConfig } from "vike-react/useConfig";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Data } from "./+data";

export default function CourseDetailPage() {
	const course = useData<Data>();
	const config = useConfig();
	config({
		title: `${course.title} | Eva-Licious`,
		description: course.description,
	});

	const totalDuration = course.steps?.reduce(
		(sum, step) => sum + (step.durationMinutes ?? 0),
		0,
	);
	const stepCount = course.steps?.length ?? 0;

	return (
		<>
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[
					{ label: "Tečaji", href: "/courses" },
					{ label: course.title },
				]}
			/>

			{/* Hero — full-width cover image with overlay */}
			<div className="relative mt-6 overflow-hidden rounded-2xl bg-gray-900">
				{course.coverImage && (
					<OptimizedImage
						image={course.coverImage}
						alt={course.title}
						width={1400}
						height={500}
						className="w-full h-64 sm:h-80 lg:h-96 object-cover opacity-60"
						priority
					/>
				)}
				{!course.coverImage && <div className="h-64 sm:h-80 lg:h-96" />}

				<div className="absolute inset-0 flex items-end">
					<div className="w-full bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent p-6 sm:p-10">
						<h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
							{course.title}
						</h1>

						{/* Stats */}
						<div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
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
								{stepCount}{" "}
								{stepCount === 1
									? "korak"
									: stepCount === 2
										? "koraka"
										: stepCount <= 4
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
										d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
								Video delavnica
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main content — two columns */}
			<div className="mt-10 lg:flex lg:gap-12">
				{/* Left — description + step list */}
				<div className="lg:flex-1 lg:min-w-0">
					{/* Description */}
					{course.description && (
						<div className="mb-10">
							<h2 className="font-serif text-2xl font-bold mb-4">
								O delavnici
							</h2>
							<p className="text-gray-600 leading-relaxed text-lg">
								{course.description}
							</p>
						</div>
					)}

					{/* Tags */}
					{course.tags && course.tags.length > 0 && (
						<div className="mb-10 flex flex-wrap gap-2">
							{course.tags.map((tag) => (
								<span
									key={tag}
									className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Step list */}
					{course.steps && course.steps.length > 0 && (
						<div>
							<h2 className="font-serif text-2xl font-bold mb-6">
								Vsebina ({stepCount}{" "}
								{stepCount === 1
									? "korak"
									: stepCount === 2
										? "koraka"
										: stepCount <= 4
											? "koraki"
											: "korakov"})
							</h2>
							<div className="space-y-2">
								{course.steps.map((step, index) => (
									<div
										key={step._id}
										className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
									>
										<span
											className={cn(
												"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
												index === 0
													? "bg-amber-500 text-white"
													: "bg-gray-100 text-gray-600",
											)}
										>
											{index + 1}
										</span>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="font-medium text-gray-900">
													{step.title}
												</h3>
												{step.isFree && (
													<span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
														Brezplačno
													</span>
												)}
											</div>
											{step.description && (
												<p className="mt-1 text-sm text-gray-500 line-clamp-2">
													{step.description}
												</p>
											)}
										</div>
										{step.durationMinutes != null &&
											step.durationMinutes > 0 && (
												<span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 pt-1">
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
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Right — sticky CTA card */}
				<div className="mt-10 lg:mt-0 lg:w-80 lg:flex-shrink-0">
					<div className="lg:sticky lg:top-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div className="text-center">
							<p className="text-sm text-gray-500 mb-1">Delavnica</p>
							<p className="font-serif text-3xl font-bold text-gray-900">
								{course.title}
							</p>
						</div>

						<div className="mt-6 space-y-3 text-sm text-gray-600">
							<div className="flex items-center justify-between">
								<span>Koraki</span>
								<span className="font-medium text-gray-900">
									{stepCount}
								</span>
							</div>
							{totalDuration > 0 && (
								<div className="flex items-center justify-between">
									<span>Trajanje</span>
									<span className="font-medium text-gray-900">
										{formatDuration(totalDuration)}
									</span>
								</div>
							)}
							<div className="flex items-center justify-between">
								<span>Video vsebina</span>
								<span className="font-medium text-green-600">Da</span>
							</div>
							<div className="flex items-center justify-between">
								<span>PDF materiali</span>
								<span className="font-medium text-green-600">Da</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Recepti</span>
								<span className="font-medium text-green-600">Da</span>
							</div>
						</div>

						<div className="mt-6 border-t border-gray-100 pt-6">
							<button
								type="button"
								className="w-full rounded-xl bg-amber-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-amber-700 transition-colors"
							>
								Kupi tečaj
							</button>
							<p className="mt-3 text-center text-xs text-gray-400">
								Dostop za vedno. Brez naročnine.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

			{/* Mobile fixed buy bar */}
			<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
				<button
					type="button"
					className="w-full rounded-xl bg-amber-600 px-6 py-3 text-base font-semibold text-white hover:bg-amber-700 transition-colors"
				>
					Kupi tečaj
				</button>
			</div>
		</>
	);
}
