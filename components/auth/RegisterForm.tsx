"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";

export function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

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
				setError(data.message ?? "Registracija ni uspela");
				capture("sign_up_error", { error: data.message });
				return;
			}

			capture("sign_up_success");
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
				<CardTitle className="font-serif text-2xl">Ustvari račun</CardTitle>
				<CardDescription>Pridruži se Eva-licious skupnosti</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="name">Ime</Label>
						<Input
							id="name"
							type="text"
							placeholder="Eva"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
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
							placeholder="Najmanj 8 znakov"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Ustvarjam račun..." : "Ustvari račun"}
					</Button>
				</form>
				<div className="mt-6 text-center text-sm text-muted-foreground">
					Že imaš račun?{" "}
					<a href="/login" className="text-primary hover:underline">
						Prijavi se
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
