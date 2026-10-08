"use client";

import { useState } from "react";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";

interface NextStepLinkProps {
	href: string;
	lessonId: string;
	children: React.ReactNode;
	className?: string;
}

export function NextStepLink({ href, lessonId, children, className }: NextStepLinkProps) {
	const { t } = useI18n();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		event.preventDefault();
		if (saving) return;

		setSaving(true);
		setError("");
		try {
			const response = await fetch(`/api/progress/lesson/${lessonId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ completed: true }),
			});
			if (!response.ok) throw new Error("Progress update failed");

			capture("lesson_completed", { lesson_id: lessonId, method: "next_step" });
			window.location.assign(href);
		} catch {
			setError(t("courses.nextStep.error"));
			setSaving(false);
		}
	}

	return (
		<span className="relative">
			<a href={href} className={className} onClick={handleClick} aria-disabled={saving}>
				{saving ? t("courses.nextStep.saving") : children}
			</a>
			{error && (
				<span
					className="absolute right-0 bottom-full mb-2 w-64 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground shadow-lg"
					role="alert"
				>
					{error}
				</span>
			)}
		</span>
	);
}
