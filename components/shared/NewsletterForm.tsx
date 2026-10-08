"use client";

import { CheckCircle } from "lucide-react";
import { useId, useState } from "react";
import { Turnstile } from "@/components/shared/Turnstile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";

/** Newsletter signup with double opt-in: the confirmation email carries the real consent. */
export function NewsletterForm({ source }: { source: string }) {
	const { t, locale } = useI18n();
	const id = useId();
	const [email, setEmail] = useState("");
	const [consent, setConsent] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [sentTo, setSentTo] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		if (!consent) {
			setError(t("common.newsletter.errorConsent"));
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, consent, locale, source, turnstileToken: token }),
			});
			if (!res.ok) {
				setError(
					res.status === 400
						? t("common.newsletter.errorInvalid")
						: res.status === 429
							? t("common.newsletter.errorRate")
							: t("common.newsletter.errorGeneric"),
				);
				capture("newsletter_error", { source, status: res.status });
				return;
			}
			capture("newsletter_requested", { source });
			setSentTo(email);
		} catch {
			setError(t("common.newsletter.errorGeneric"));
		} finally {
			setLoading(false);
		}
	}

	if (sentTo) {
		return (
			<div className="space-y-1 text-sm">
				<p className="flex items-center gap-2 font-semibold">
					<CheckCircle className="h-4 w-4 text-green-600" />
					{t("common.newsletter.sentTitle")}
				</p>
				<p className="text-muted-foreground">
					{t("common.newsletter.sentText", { email: sentTo })}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div className="flex flex-col gap-2 sm:flex-row">
				<Label htmlFor={`${id}-email`} className="sr-only">
					{t("common.newsletter.title")}
				</Label>
				<Input
					id={`${id}-email`}
					type="email"
					autoComplete="email"
					placeholder={t("common.newsletter.placeholder")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="bg-background"
				/>
				<Button type="submit" disabled={loading} className="shrink-0">
					{loading ? t("common.newsletter.sending") : t("common.newsletter.submit")}
				</Button>
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
					{t("common.newsletter.consent")}
				</Label>
			</div>
			<Turnstile onToken={setToken} />
			{error && <p className="text-sm text-destructive">{error}</p>}
		</form>
	);
}
