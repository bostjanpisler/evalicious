import { usePageContext } from "vike-react/usePageContext";
import { useI18n } from "@/lib/i18n/react";

interface User {
	id: string;
	name: string | null;
	email: string;
}

export default function SettingsPage() {
	const pageContext = usePageContext();
	const { t } = useI18n();
	const user = (pageContext as unknown as { user: User }).user;

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">{t("dashboard.settings.heading")}</h2>

			<div className="rounded-lg border border-border p-6 max-w-lg">
				<h3 className="font-serif text-lg font-semibold mb-4">
					{t("dashboard.settings.accountDetails")}
				</h3>

				<div className="space-y-4">
					<div>
						<p className="block text-sm font-medium text-muted-foreground mb-1">
							{t("dashboard.settings.name")}
						</p>
						<p className="text-foreground">{user?.name ?? t("dashboard.settings.notSet")}</p>
					</div>

					<div>
						<p className="block text-sm font-medium text-muted-foreground mb-1">
							{t("dashboard.settings.email")}
						</p>
						<p className="text-foreground">{user?.email ?? t("dashboard.settings.notAvailable")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
