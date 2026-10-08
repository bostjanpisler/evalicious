"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";
import { DEFAULT_AUTH_REDIRECT, getSafeRedirect } from "@/lib/safe-redirect";

export function LoginForm() {
	const { t, l } = useI18n();
	const [redirectTo, setRedirectTo] = useState(l(DEFAULT_AUTH_REDIRECT));
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setRedirectTo(
			getSafeRedirect(
				new URLSearchParams(window.location.search).get("redirect"),
				l(DEFAULT_AUTH_REDIRECT),
			),
		);
	}, [l]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/sign-in/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(t("auth.login.invalid"));
				capture("sign_in_error", { error: data.message });
				return;
			}

			capture("sign_in_success");
			window.location.href = redirectTo;
		} catch {
			setError(t("auth.errors.generic"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-serif text-2xl">{t("auth.login.heading")}</CardTitle>
				<CardDescription>{t("auth.login.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="email">{t("auth.login.email")}</Label>
						<Input
							id="email"
							type="email"
							placeholder={t("auth.login.emailPlaceholder")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">{t("auth.login.password")}</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? t("auth.login.submitting") : t("auth.login.submit")}
					</Button>
				</form>
				<div className="mt-6 text-center text-sm text-muted-foreground">
					{t("auth.login.noAccount")}{" "}
					<a
						href={`${l("/register")}?redirect=${encodeURIComponent(redirectTo)}`}
						className="text-primary hover:underline"
					>
						{t("auth.login.registerLink")}
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
