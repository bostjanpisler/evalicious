"use client";

import posthog from "posthog-js";

interface NextStepLinkProps {
	href: string;
	lessonId: string;
	children: React.ReactNode;
	className?: string;
}

export function NextStepLink({
	href,
	lessonId,
	children,
	className,
}: NextStepLinkProps) {
	function handleClick() {
		// Fire and forget — mark current step complete in the background
		fetch(`/api/progress/lesson/${lessonId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ completed: true }),
		}).catch(() => {});
		posthog.capture("lesson_completed", { lesson_id: lessonId, method: "next_step" });
	}

	return (
		<a href={href} className={className} onClick={handleClick}>
			{children}
		</a>
	);
}
