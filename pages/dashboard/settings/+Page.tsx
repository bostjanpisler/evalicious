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
			<h2 className="font-serif text-2xl font-bold mb-6">Settings</h2>

			<div className="rounded-lg border border-gray-200 p-6 max-w-lg">
				<h3 className="font-serif text-lg font-semibold mb-4">
					Account Information
				</h3>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-500 mb-1">
							Name
						</label>
						<p className="text-gray-900">
							{user?.name ?? "Not set"}
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-500 mb-1">
							Email
						</label>
						<p className="text-gray-900">
							{user?.email ?? "Not available"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
