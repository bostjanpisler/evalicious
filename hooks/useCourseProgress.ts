import { useCallback, useEffect, useState } from "react";

interface CourseProgress {
	completedLessons: string[];
	totalLessons: number;
	percentage: number;
}

interface UseCourseProgressReturn {
	progress: CourseProgress;
	loading: boolean;
	error: string | null;
	toggleLesson: (lessonSlug: string) => Promise<void>;
	isCompleted: (lessonSlug: string) => boolean;
}

export function useCourseProgress(courseId: string): UseCourseProgressReturn {
	const [progress, setProgress] = useState<CourseProgress>({
		completedLessons: [],
		totalLessons: 0,
		percentage: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProgress = useCallback(async () => {
		if (!courseId) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/progress/${courseId}`);
			if (!res.ok) throw new Error("Napredka ni bilo mogoče naložiti.");
			const data = await res.json();
			setProgress({
				completedLessons: data.completedLessons ?? [],
				totalLessons: data.totalLessons ?? 0,
				percentage: data.percentage ?? 0,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Napredka pri tečaju ni bilo mogoče naložiti.");
		} finally {
			setLoading(false);
		}
	}, [courseId]);

	useEffect(() => {
		fetchProgress();
	}, [fetchProgress]);

	const toggleLesson = useCallback(
		async (lessonSlug: string) => {
			try {
				const res = await fetch(`/api/progress/${courseId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ lessonSlug }),
				});
				if (!res.ok) throw new Error("Napredka ni bilo mogoče posodobiti.");
				setProgress((prev) => {
					const isCurrentlyCompleted = prev.completedLessons.includes(lessonSlug);
					const completedLessons = isCurrentlyCompleted
						? prev.completedLessons.filter((s) => s !== lessonSlug)
						: [...prev.completedLessons, lessonSlug];

					const percentage =
						prev.totalLessons > 0
							? Math.round((completedLessons.length / prev.totalLessons) * 100)
							: 0;

					return {
						...prev,
						completedLessons,
						percentage,
					};
				});
			} catch (err) {
				setError(err instanceof Error ? err.message : "Napredka ni bilo mogoče posodobiti.");
			}
		},
		[courseId],
	);

	const isCompleted = useCallback(
		(lessonSlug: string) => {
			return progress.completedLessons.includes(lessonSlug);
		},
		[progress.completedLessons],
	);

	return { progress, loading, error, toggleLesson, isCompleted };
}
