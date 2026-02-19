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
					<p className="text-gray-500">
						Tukaj se bodo prikazali tvoji kupljeni tečaji.
					</p>
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
		</div>
	);
}
