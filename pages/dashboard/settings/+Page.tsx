import { usePageContext } from "vike-react/usePageContext";

interface User {
	id: string;
	name: string | null;
	email: string;
}

export default function SettingsPage() {
	const pageContext = usePageContext();
	const user = (pageContext as unknown as { user: User }).user;

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">Nastavitve</h2>

			<div className="rounded-lg border border-border p-6 max-w-lg">
				<h3 className="font-serif text-lg font-semibold mb-4">Podatki o računu</h3>

				<div className="space-y-4">
					<div>
						<p className="block text-sm font-medium text-muted-foreground mb-1">Ime</p>
						<p className="text-foreground">{user?.name ?? "Ni nastavljeno"}</p>
					</div>

					<div>
						<p className="block text-sm font-medium text-muted-foreground mb-1">E-pošta</p>
						<p className="text-foreground">{user?.email ?? "Ni na voljo"}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
