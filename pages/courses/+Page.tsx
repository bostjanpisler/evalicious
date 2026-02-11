import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CourseCard } from "@/components/courses/CourseCard";
import type { Data } from "./+data";

export default function CoursesPage() {
	const { courses } = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Tečaji" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Kulinarične delavnice</h1>
			<p className="mt-2 text-muted-foreground">
				Poglobi svoje kuharsko znanje s korak-za-korakom video delavnicami.
			</p>

			<div className="mt-8">
				{courses.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Tečaji bodo na voljo kmalu.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{courses.map((course) => (
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
				)}
			</div>
		</div>
	);
}
