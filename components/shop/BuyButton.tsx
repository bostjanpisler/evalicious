"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

interface BuyButtonProps {
	productSlug: string;
	className?: string;
}

export function BuyButton({ productSlug, className }: BuyButtonProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [session, setSession] = useState<{
		user: { id: string; email: string };
	} | null>(null);
	const [sessionLoading, setSessionLoading] = useState(true);

	useEffect(() => {
		fetch("/api/auth/get-session", { credentials: "include" })
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => setSession(data))
			.catch(() => setSession(null))
			.finally(() => setSessionLoading(false));
	}, []);

	async function handleClick() {
		if (!session?.user) {
			posthog.capture("checkout_login_required", { product_slug: productSlug });
			window.location.href = `/login?redirect=/shop/${productSlug}`;
			return;
		}

		setError("");
		setLoading(true);

		try {
			posthog.capture("checkout_started", { product_slug: productSlug });

		const res = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ productSlug }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error ?? "Nekaj je šlo narobe");
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
			<Button
				onClick={handleClick}
				disabled={loading || sessionLoading}
				size="lg"
				className="w-full"
			>
				{sessionLoading
					? "Nalagam..."
					: loading
						? "Preusmerjam..."
						: !session?.user
							? "Prijavi se za nakup"
							: "Kupi zdaj"}
			</Button>
			{error && (
				<p className="mt-2 text-sm text-destructive">{error}</p>
			)}
		</div>
	);
}
