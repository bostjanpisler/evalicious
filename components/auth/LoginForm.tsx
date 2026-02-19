"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

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
				setError(data.message ?? "Napačni podatki za prijavo");
				posthog.capture("sign_in_error", { error: data.message });
				return;
			}

			posthog.capture("sign_in_success");
			window.location.href = "/dashboard/my-recipes";
		} catch {
			setError("Nekaj je šlo narobe. Poskusi znova.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-serif text-2xl">Dobrodošli nazaj</CardTitle>
				<CardDescription>Prijavi se v svoj račun</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="email">E-pošta</Label>
						<Input
							id="email"
							type="email"
							placeholder="tvoj@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Geslo</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Prijavljam..." : "Prijava"}
					</Button>
				</form>
				<div className="mt-6 text-center text-sm text-muted-foreground">
					Še nimaš računa?{" "}
					<a href="/register" className="text-primary hover:underline">
						Registriraj se
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
