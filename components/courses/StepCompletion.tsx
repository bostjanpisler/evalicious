"use client";

import { useState, useCallback } from "react";
import confetti from "canvas-confetti";

interface StepCompletionProps {
	lessonId: string;
	initialCompleted: boolean;
	onComplete?: () => void;
	compact?: boolean;
}

export function StepCompletion({
	lessonId,
	initialCompleted,
	onComplete,
	compact = false,
}: StepCompletionProps) {
	const [completed, setCompleted] = useState(initialCompleted);
	const [loading, setLoading] = useState(false);

	const fireConfetti = useCallback(() => {
		const duration = 2000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.7 },
				colors: ["#f59e0b", "#d97706", "#fbbf24", "#92400e"],
			});
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.7 },
				colors: ["#f59e0b", "#d97706", "#fbbf24", "#92400e"],
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};
		frame();
	}, []);

	async function toggle() {
		const next = !completed;
		setCompleted(next);
		setLoading(true);

		try {
			const res = await fetch(`/api/progress/lesson/${lessonId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ completed: next }),
			});
			if (!res.ok) {
				setCompleted(!next);
			} else if (next) {
				onComplete?.();
			}
		} catch {
			setCompleted(!next);
		} finally {
			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={loading}
			className={
				compact
					? `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
							completed
								? "bg-green-50 text-green-700 border border-green-200"
								: "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
						}`
					: "flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
			}
		>
			<span
				className={`flex items-center justify-center rounded transition-colors ${
					compact ? "h-5 w-5 rounded-full border-2" : "h-5 w-5 rounded border-2"
				} ${
					completed
						? "border-green-500 bg-green-500 text-white"
						: compact
							? "border-amber-400 bg-white"
							: "border-gray-300"
				}`}
			>
				{completed && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-3.5 w-3.5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				)}
			</span>
			<span>
				{completed ? "Opravljeno" : compact ? "Opravljeno?" : "Označi kot opravljeno"}
			</span>
		</button>
	);
}

export function fireCompletionConfetti() {
	confetti({
		particleCount: 80,
		spread: 70,
		origin: { y: 0.6 },
		colors: ["#f59e0b", "#d97706", "#fbbf24", "#10b981"],
	});
}
