import { cn } from "@/lib/utils";

interface Lesson {
	slug: string;
	title: string;
}

interface Chapter {
	title: string;
	lessons: Lesson[];
}

interface ChapterSidebarProps {
	chapters: Chapter[];
	progress: Record<string, boolean>;
	courseSlug: string;
	currentLessonSlug?: string;
}

export function ChapterSidebar({
	chapters,
	progress,
	courseSlug,
	currentLessonSlug,
}: ChapterSidebarProps) {
	return (
		<nav className="space-y-6">
			{chapters.map((chapter, index) => (
				<div key={index}>
					<h4 className="font-serif text-sm font-semibold text-gray-900 mb-2">
						{chapter.title}
					</h4>
					<ul className="space-y-1">
						{chapter.lessons.map((lesson) => {
							const isCompleted = progress[lesson.slug] === true;
							const isActive =
								currentLessonSlug === lesson.slug;

							return (
								<li key={lesson.slug}>
									<a
										href={`/dashboard/my-courses/${courseSlug}/${lesson.slug}`}
										className={cn(
											"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
											isActive
												? "bg-amber-50 text-amber-900 font-medium"
												: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
										)}
									>
										{isCompleted ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 text-green-500 flex-shrink-0"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
										) : (
											<span className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
										)}
										<span className="truncate">
											{lesson.title}
										</span>
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}
