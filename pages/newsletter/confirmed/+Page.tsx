import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Head } from "vike-react/Head";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/react";

export default function NewsletterConfirmedPage() {
	const { t, l } = useI18n();
	const status = usePageContext().urlParsed.search.status;
	const state = status === "ok" ? "ok" : status === "expired" ? "expired" : "invalid";
	const Icon = state === "ok" ? CheckCircle : state === "expired" ? Clock : XCircle;
	const color = state === "ok" ? "text-green-600" : "text-muted-foreground";
	const key = (suffix: string) =>
		`common.newsletter.confirmed.${suffix}` as Parameters<typeof t>[0];

	return (
		<div className="mx-auto max-w-xl px-4 py-24 text-center">
			<Head>
				<meta name="robots" content="noindex" />
			</Head>
			<Icon className={`mx-auto h-12 w-12 ${color}`} />
			<h1 className="mt-6 font-serif text-3xl font-bold">
				{t(key(state === "ok" ? "title" : `${state}Title`))}
			</h1>
			<p className="mt-4 text-muted-foreground">
				{t(key(state === "ok" ? "text" : `${state}Text`))}
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Button asChild>
					<a href={l("/")}>{t("common.newsletter.confirmed.home")}</a>
				</Button>
				{state !== "ok" && (
					<Button asChild variant="outline">
						<a href={l("/#newsletter")}>{t("common.newsletter.confirmed.subscribeAgain")}</a>
					</Button>
				)}
			</div>
		</div>
	);
}
