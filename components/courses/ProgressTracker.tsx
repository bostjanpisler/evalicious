import { useI18n } from "@/lib/i18n/react";

interface ProgressTrackerProps {
	completed: number;
	total: number;
}

export function ProgressTracker({ completed, total }: ProgressTrackerProps) {
	const { t } = useI18n();
	const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

	return (
		<div>
			<div className="flex items-center justify-between text-sm mb-2">
				<span className="text-muted-foreground">
					{t("courses.tracker.label", { completed, total })}
				</span>
				<span className="font-medium text-foreground">{percentage}%</span>
			</div>
			<div className="h-3 rounded-full bg-muted overflow-hidden">
				<div
					className="h-full rounded-full bg-amber-500 transition-all duration-300"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
