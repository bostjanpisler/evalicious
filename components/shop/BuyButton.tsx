"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BuyButtonProps {
	productId: string;
	className?: string;
}

export function BuyButton({ productId, className }: BuyButtonProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleClick() {
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productId }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.message ?? "Something went wrong");
				return;
			}

			const { url } = await res.json();
			window.location.href = url;
		} catch {
			setError("Failed to start checkout. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={className}>
			<Button onClick={handleClick} disabled={loading} className="w-full">
				{loading ? "Redirecting..." : "Buy Now"}
			</Button>
			{error && (
				<p className="mt-2 text-sm text-destructive">{error}</p>
			)}
		</div>
	);
}
