"use client";

import { usePageContext } from "vike-react/usePageContext";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard/my-recipes", label: "Moji recepti", icon: "heart" },
	{ href: "/dashboard/my-courses", label: "Moji tečaji", icon: "book" },
	{ href: "/dashboard/my-orders", label: "Moja naročila", icon: "receipt" },
	{ href: "/dashboard/settings", label: "Nastavitve", icon: "settings" },
];

function NavIcon({ icon, className }: { icon: string; className?: string }) {
	switch (icon) {
		case "heart":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className={cn("h-5 w-5", className)}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			);
		case "book":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className={cn("h-5 w-5", className)}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			);
		case "receipt":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className={cn("h-5 w-5", className)}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
					/>
				</svg>
			);
		case "settings":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className={cn("h-5 w-5", className)}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			);
		default:
			return null;
	}
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pageContext = usePageContext();
	const currentPath = pageContext.urlPathname;

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-serif text-3xl font-bold">Nadzorna plošča</h1>
			</div>

			{/* Horizontal nav */}
			<nav className="mb-8 border-b border-gray-200">
				<div className="flex gap-1 overflow-x-auto -mb-px">
					{navItems.map((item) => {
						const isActive = currentPath.startsWith(item.href);
						return (
							<a
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
									isActive
										? "border-amber-500 text-amber-900"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
								)}
							>
								<NavIcon icon={item.icon} />
								{item.label}
							</a>
						);
					})}
				</div>
			</nav>

			{/* Main content — full width */}
			<main>{children}</main>
		</div>
	);
}
