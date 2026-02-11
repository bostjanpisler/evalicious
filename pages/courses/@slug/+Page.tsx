import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatDuration } from "@/lib/utils";
import type { Data } from "./+data";

export default function CourseDetailPage() {
	const course = useData<Data>();

	const totalDuration = course.steps?.reduce(
		(sum, step) => sum + (step.durationMinutes ?? 0),
		0,
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[
					{ label: "Tečaji", href: "/courses" },
					{ label: course.title },
				]}
			/>

			{/* Hero */}
			<div className="mt-6 lg:flex lg:gap-10">
				{course.coverImage && (
					<div className="lg:w-1/2 mb-6 lg:mb-0">
						<OptimizedImage
							image={course.coverImage}
							alt={course.title}
							width={800}
							height={450}
							className="w-full rounded-xl object-cover"
							priority
						/>
					</div>
				)}

				<div className={course.coverImage ? "lg:w-1/2" : ""}>
					<h1 className="font-serif text-4xl font-bold">{course.title}</h1>

					{course.description && (
						<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
							{course.description}
						</p>
					)}

					<div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
						<span>{course.steps?.length ?? 0} korakov</span>
						{totalDuration > 0 && <span>{formatDuration(totalDuration)}</span>}
					</div>

					{course.tags && course.tags.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-2">
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

					<div className="mt-8">
						<button
							type="button"
							className="inline-flex items-center rounded-lg bg-amber-600 px-6 py-3 text-base font-medium text-white hover:bg-amber-700 transition-colors"
						>
							Kupi tečaj
						</button>
					</div>
				</div>
			</div>

			{/* Step list */}
			{course.steps && course.steps.length > 0 && (
				<div className="mt-12">
					<h2 className="font-serif text-2xl font-bold mb-6">Vsebina tečaja</h2>
					<div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
						{course.steps.map((step, index) => (
							<div
								key={step._id}
								className="flex items-center gap-4 px-6 py-4"
							>
								<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
									{index + 1}
								</span>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium truncate">{step.title}</h3>
									{step.description && (
										<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
											{step.description}
										</p>
									)}
								</div>
								<div className="flex items-center gap-3 flex-shrink-0">
									{step.isFree && (
										<span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
											Brezplačno
										</span>
									)}
									{step.durationMinutes && (
										<span className="text-sm text-muted-foreground">
											{formatDuration(step.durationMinutes)}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
