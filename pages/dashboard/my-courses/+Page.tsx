import { useData } from "vike-react/useData";
import { CourseCard } from "@/components/courses/CourseCard";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import type { Data } from "./+data.server";

export default function MyCoursesPage() {
	const { courses, suggestions } = useData<Data>();

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">Moji tečaji</h2>

			{courses.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">
						Tukaj se bodo prikazali tvoji kupljeni tečaji.
					</p>
					<a
						href="/courses"
						className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
					>
						Razišči tečaje
					</a>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => (
						<CourseCard
							key={course._id}
							title={course.title}
							description={course.description ?? ""}
							progress={course.progress}
							href={`/dashboard/my-courses/${course.slug}`}
							coverImage={course.coverImage}
							stepCount={course.stepCount}
							completed={course.progress === 100}
						/>
					))}
				</div>
			)}

			{/* Suggestions — courses user doesn't own */}
			{suggestions.length > 0 && (
				<div className="mt-14">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200" />
						</div>
						<div className="relative flex justify-center">
							<span className="bg-white px-4 text-sm font-medium text-gray-500">
								Razišči še
							</span>
						</div>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{suggestions.map((course) => (
							<a
								key={course._id}
								href={`/courses/${course.slug}`}
								className="group rounded-xl border border-dashed border-gray-300 overflow-hidden hover:border-amber-400 hover:shadow-md transition-all"
							>
								{course.coverImage ? (
									<OptimizedImage
										image={course.coverImage}
										alt={course.title}
										width={400}
										height={220}
										className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
									/>
								) : (
									<div className="h-40 bg-gradient-to-br from-amber-50 to-amber-100" />
								)}
								<div className="p-4">
									<h3 className="font-serif font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
										{course.title}
									</h3>
									{course.description && (
										<p className="mt-1 text-sm text-gray-500 line-clamp-2">
											{course.description}
										</p>
									)}
									<div className="mt-3 flex items-center justify-between">
										<span className="text-xs text-gray-400">
											{course.stepCount}{" "}
											{course.stepCount === 1
												? "korak"
												: course.stepCount === 2
													? "koraka"
													: course.stepCount <= 4
														? "koraki"
														: "korakov"}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 group-hover:bg-amber-100">
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
		</div>
	);
}
