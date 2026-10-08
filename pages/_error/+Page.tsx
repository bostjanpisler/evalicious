import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/react";

export default function ErrorPage() {
	const pageContext = usePageContext();
	const { t, l } = useI18n();
	const { is404 } = pageContext;

	if (is404) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
				<h1 className="font-serif text-6xl font-bold">404</h1>
				<p className="mt-4 text-lg text-muted-foreground">{t("common.error.notFound")}</p>
				<div className="mt-8">
					<Button asChild>
						<a href={l("/")}>{t("common.error.backHome")}</a>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="font-serif text-6xl font-bold">{t("common.error.title")}</h1>
			<p className="mt-4 text-lg text-muted-foreground">{t("common.error.unexpected")}</p>
			<div className="mt-8">
				<Button asChild>
					<a href={l("/")}>{t("common.error.backHome")}</a>
				</Button>
			</div>
		</div>
	);
}
