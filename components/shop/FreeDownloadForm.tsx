"use client";

import { CheckCircle, Download } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";

const EMAIL_TOKEN = "\u0000email\u0000";

interface FreeDownloadFormProps {
	productSlug: string;
}

export function FreeDownloadForm({ productSlug }: FreeDownloadFormProps) {
	const { t, locale } = useI18n();
	const id = useId();
	const [email, setEmail] = useState("");
	const [consent, setConsent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [sentTo, setSentTo] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (new URLSearchParams(window.location.search).get("download") === "expired") {
			setError(t("shop.freeDownload.linkExpired"));
		}
		fetch("/api/auth/get-session", { credentials: "include" })
			.then((res) => (res.ok ? res.json() : null))
			.then((data: { user?: { email?: string } } | null) => {
				if (data?.user?.email) setEmail((current) => current || (data.user?.email ?? ""));
			})
			.catch(() => undefined);
	}, [t]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		if (!consent) {
			setError(t("shop.freeDownload.consentRequired"));
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`/api/download/free/${productSlug}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, consent, locale }),
			});
			if (!res.ok) {
				setError(
					res.status === 400
						? t("shop.freeDownload.checkEmail")
						: res.status === 429
							? t("shop.freeDownload.tooMany")
							: t("shop.freeDownload.sendFailed"),
				);
				capture("free_download_error", { product_slug: productSlug, status: res.status });
				return;
			}
			capture("free_download_requested", { product_slug: productSlug });
			setSentTo(email);
		} catch {
			setError(t("shop.freeDownload.genericError"));
		} finally {
			setLoading(false);
		}
	}

	if (sentTo) {
		const sentMessage = t("shop.freeDownload.sentTo", { email: EMAIL_TOKEN }).split(EMAIL_TOKEN);
		return (
			<div className="mt-3 space-y-1 text-sm text-green-800">
				<p className="flex items-center justify-center gap-2 font-semibold">
					<CheckCircle className="h-4 w-4" />
					{t("shop.freeDownload.sentTitle")}
				</p>
				<p>
					{sentMessage[0]}
					<strong>{sentTo}</strong>
					{sentMessage[1]}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="mt-3 space-y-3 text-left">
			<div className="space-y-1.5">
				<Label htmlFor={`${id}-email`}>{t("shop.freeDownload.emailLabel")}</Label>
				<Input
					id={`${id}-email`}
					type="email"
					placeholder={t("shop.freeDownload.emailPlaceholder")}
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="bg-background"
				/>
			</div>
			<div className="flex items-start gap-2">
				<Checkbox
					id={`${id}-consent`}
					checked={consent}
					onCheckedChange={(checked) => setConsent(checked === true)}
					className="mt-0.5"
				/>
				<Label
					htmlFor={`${id}-consent`}
					className="text-xs font-normal leading-snug text-muted-foreground"
				>
					{t("shop.freeDownload.consent")}
				</Label>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" className="w-full gap-2" disabled={loading}>
				<Download className="h-4 w-4" />
				{loading ? t("shop.freeDownload.sending") : t("shop.freeDownload.submit")}
			</Button>
			<p className="text-xs text-muted-foreground">{t("shop.freeDownload.accountNote")}</p>
		</form>
	);
}
