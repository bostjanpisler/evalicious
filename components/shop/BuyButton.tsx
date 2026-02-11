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
				setError(data.message ?? "Nekaj je šlo narobe");
				return;
			}

			const { url } = await res.json();
			window.location.href = url;
		} catch {
			setError("Napaka pri začetku plačila. Poskusi znova.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={className}>
			<Button onClick={handleClick} disabled={loading} className="w-full">
				{loading ? "Preusmerjam..." : "Kupi zdaj"}
			</Button>
			{error && (
				<p className="mt-2 text-sm text-destructive">{error}</p>
			)}
		</div>
	);
}
