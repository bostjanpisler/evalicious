"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";
import { DEFAULT_AUTH_REDIRECT, getSafeRedirect } from "@/lib/safe-redirect";

export function RegisterForm() {
	const { t, l } = useI18n();
	const [redirectTo, setRedirectTo] = useState(l(DEFAULT_AUTH_REDIRECT));
	const [name, setName] = useState("");
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
			const res = await fetch("/api/auth/sign-up/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(t("auth.register.failed"));
				capture("sign_up_error", { error: data.message });
				return;
			}

			capture("sign_up_success");
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
				<CardTitle className="font-serif text-2xl">{t("auth.register.heading")}</CardTitle>
				<CardDescription>{t("auth.register.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="name">{t("auth.register.name")}</Label>
						<Input
							id="name"
							type="text"
							placeholder={t("auth.register.namePlaceholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">{t("auth.register.email")}</Label>
						<Input
							id="email"
							type="email"
							placeholder={t("auth.register.emailPlaceholder")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">{t("auth.register.password")}</Label>
						<Input
							id="password"
							type="password"
							placeholder={t("auth.register.passwordPlaceholder")}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? t("auth.register.submitting") : t("auth.register.submit")}
					</Button>
				</form>
				<div className="mt-6 text-center text-sm text-muted-foreground">
					{t("auth.register.haveAccount")}{" "}
					<a
						href={`${l("/login")}?redirect=${encodeURIComponent(redirectTo)}`}
						className="text-primary hover:underline"
					>
						{t("auth.register.loginLink")}
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
