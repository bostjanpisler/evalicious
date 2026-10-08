"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";

export function ResetPasswordForm() {
	const { t, l } = useI18n();
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.hash.slice(1));
		setToken(params.get("token") ?? new URLSearchParams(window.location.search).get("token") ?? "");
		window.history.replaceState(null, "", window.location.pathname);
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, newPassword: password }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				setError(
					data?.code === "PASSWORD_TOO_SHORT"
						? t("auth.reset.tooShort")
						: t("auth.reset.invalidLink"),
				);
				return;
			}

			capture("password_set");
			setDone(true);
		} catch {
			setError(t("auth.errors.generic"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-serif text-2xl">{t("auth.reset.heading")}</CardTitle>
				<CardDescription>{t("auth.reset.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				{done ? (
					<div className="space-y-4 text-center">
						<p className="text-sm text-muted-foreground">{t("auth.reset.done")}</p>
						<Button asChild className="w-full">
							<a href={l("/login")}>{t("auth.reset.login")}</a>
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="password">{t("auth.reset.newPassword")}</Label>
							<Input
								id="password"
								type="password"
								autoComplete="new-password"
								minLength={8}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading || !token}>
							{loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
						</Button>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
