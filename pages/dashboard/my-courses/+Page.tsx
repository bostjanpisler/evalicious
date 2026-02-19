import { useData } from "vike-react/useData";
import { CourseCard } from "@/components/courses/CourseCard";
import type { Data } from "./+data.server";

export default function MyCoursesPage() {
	const { courses, suggestions } = useData<Data>();

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">Moji tečaji</h2>

			{courses.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						Tukaj se bodo prikazali tvoji kupljeni tečaji.
					</p>
					<a
						href="/courses"
						className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
					>
						Razišči tečaje →
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

			{suggestions.length > 0 && (
				<div className="mt-14">
					<h3 className="font-serif text-xl font-semibold mb-6">Razišči še</h3>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{suggestions.map((course) => (
							<CourseCard
								key={course._id}
								title={course.title}
								description={course.description ?? ""}
								href={`/courses/${course.slug}`}
								coverImage={course.coverImage}
								stepCount={course.stepCount}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
