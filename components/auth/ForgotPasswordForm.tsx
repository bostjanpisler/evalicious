"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/react";

export function ForgotPasswordForm() {
	const { t, l } = useI18n();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/request-password-reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, redirectTo: l("/reset-password") }),
			});
			if (!res.ok) {
				setError(t("auth.errors.generic"));
				return;
			}
			setSent(true);
		} catch {
			setError(t("auth.errors.generic"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-serif text-2xl">{t("auth.forgot.heading")}</CardTitle>
				<CardDescription>{t("auth.forgot.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				{sent ? (
					<p className="text-center text-sm text-muted-foreground">{t("auth.forgot.sent")}</p>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">{t("auth.forgot.email")}</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
						</Button>
					</form>
				)}
				<div className="mt-6 text-center text-sm">
					<a href={l("/login")} className="text-primary hover:underline">
						{t("auth.forgot.back")}
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
