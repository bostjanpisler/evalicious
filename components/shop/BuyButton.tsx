"use client";

import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/react";

interface BuyButtonProps {
	productSlug: string;
	className?: string;
}

export function BuyButton({ productSlug, className }: BuyButtonProps) {
	const { t, l, locale } = useI18n();
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
			window.location.href = `${l("/login")}?redirect=${l(`/shop/${productSlug}`)}`;
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
				body: JSON.stringify({ productSlug, locale }),
			});

			if (!res.ok) {
				if (res.status === 401) {
					window.location.href = `${l("/login")}?redirect=${encodeURIComponent(l(`/shop/${productSlug}`))}`;
					return;
				}
				setError(res.status === 409 ? t("shop.buy.alreadyOwned") : t("shop.buy.cannotStart"));
				return;
			}

			const { url } = await res.json();
			window.location.href = url;
		} catch {
			setError(t("shop.buy.startError"));
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
					? t("shop.buy.loading")
					: loading
						? t("shop.buy.redirecting")
						: !session?.user
							? t("shop.buy.loginToBuy")
							: t("shop.buy.buyNow")}
			</Button>
			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
		</div>
	);
}
