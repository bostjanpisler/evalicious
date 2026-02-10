import { usePageContext } from "vike-react/usePageContext";

export default function LessonViewPage() {
	const pageContext = usePageContext();
	const { courseSlug, lessonSlug } = pageContext.routeParams;

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-4">
				Lesson: {lessonSlug}
			</h2>
			<p className="text-sm text-gray-400 mb-6">
				Course: {courseSlug}
			</p>
			<div className="rounded-lg border border-gray-200 p-8 text-center">
				<p className="text-gray-500">
					Lesson content will be rendered here.
				</p>
			</div>
		</div>
	);
}
