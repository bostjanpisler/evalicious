"use client";

import { useState } from "react";
import { capture } from "@/lib/analytics-client";

interface ResetProgressProps {
	courseId: string;
	dark?: boolean;
}

export function ResetProgress({ courseId, dark = false }: ResetProgressProps) {
	const [confirming, setConfirming] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleReset() {
		setLoading(true);
		try {
			const res = await fetch(`/api/progress/${courseId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				capture("course_progress_reset", { course_id: courseId });
				window.location.reload();
			}
		} catch {
			// ignore
		} finally {
			setLoading(false);
			setConfirming(false);
		}
	}

	if (confirming) {
		return (
			<div className="flex items-center gap-2">
				<span className={`text-sm ${dark ? "text-gray-300" : "text-gray-500"}`}>Ponastavi?</span>
				<button
					type="button"
					onClick={handleReset}
					disabled={loading}
					className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
				>
					{loading ? "..." : "Da"}
				</button>
				<button
					type="button"
					onClick={() => setConfirming(false)}
					className={`text-sm ${dark ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
				>
					Ne
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setConfirming(true)}
			className={`text-sm transition-colors ${dark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
		>
			Ponastavi
		</button>
	);
}
