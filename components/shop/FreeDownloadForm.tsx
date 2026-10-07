"use client";

import { CheckCircle, Download } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { FREE_DOWNLOAD_CONSENT_TEXT } from "@/lib/constants";

interface FreeDownloadFormProps {
	productSlug: string;
}

export function FreeDownloadForm({ productSlug }: FreeDownloadFormProps) {
	const id = useId();
	const [email, setEmail] = useState("");
	const [consent, setConsent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [sentTo, setSentTo] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (new URLSearchParams(window.location.search).get("download") === "expired") {
			setError("Povezava za prenos je potekla. Vpiši e-pošto in poslali ti bomo novo.");
		}
		fetch("/api/auth/get-session", { credentials: "include" })
			.then((res) => (res.ok ? res.json() : null))
			.then((data: { user?: { email?: string } } | null) => {
				if (data?.user?.email) setEmail((current) => current || (data.user?.email ?? ""));
			})
			.catch(() => undefined);
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		if (!consent) {
			setError("Za prenos potrebujemo tvoje soglasje.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`/api/download/free/${productSlug}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, consent }),
			});
			if (!res.ok) {
				setError(
					res.status === 400
						? "Preveri e-poštni naslov."
						: res.status === 429
							? "Preveč zahtev. Poskusi znova čez nekaj minut."
							: "Pošiljanje trenutno ni mogoče. Poskusi znova pozneje.",
				);
				capture("free_download_error", { product_slug: productSlug, status: res.status });
				return;
			}
			capture("free_download_requested", { product_slug: productSlug });
			setSentTo(email);
		} catch {
			setError("Nekaj je šlo narobe. Poskusi znova.");
		} finally {
			setLoading(false);
		}
	}

	if (sentTo) {
		return (
			<div className="mt-3 space-y-1 text-sm text-green-800">
				<p className="flex items-center justify-center gap-2 font-semibold">
					<CheckCircle className="h-4 w-4" />
					Preveri svoj e-poštni predal
				</p>
				<p>
					Povezavo za prenos smo poslali na <strong>{sentTo}</strong>.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="mt-3 space-y-3 text-left">
			<div className="space-y-1.5">
				<Label htmlFor={`${id}-email`}>E-pošta</Label>
				<Input
					id={`${id}-email`}
					type="email"
					placeholder="tvoj@email.com"
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
				<Label htmlFor={`${id}-consent`} className="text-xs font-normal leading-snug text-muted-foreground">
					{FREE_DOWNLOAD_CONSENT_TEXT}
				</Label>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" className="w-full gap-2" disabled={loading}>
				<Download className="h-4 w-4" />
				{loading ? "Pošiljam..." : "Pošlji mi brezplačno"}
			</Button>
			<p className="text-xs text-muted-foreground">
				Ob prenosu ti ustvarimo račun na Eva-licious, kjer lahko nastaviš geslo.
			</p>
		</form>
	);
}
