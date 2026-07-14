"use client";

import { BookOpen, Heart, LogOut, Menu, ReceiptText, Settings } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

export function MobileNav() {
	const pageContext = usePageContext();
	const user = pageContext.user;

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Odpri meni">
					<Menu className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-72">
				<SheetHeader>
					<SheetTitle className="font-serif text-xl text-primary">{SITE_NAME}</SheetTitle>
				</SheetHeader>
				<nav className="mt-8 flex flex-col gap-4">
					{NAV_ITEMS.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="text-lg font-medium text-foreground transition-colors hover:text-primary"
						>
							{item.label}
						</a>
					))}
				</nav>

				<div className="mt-8 border-t border-border pt-6">
					{user ? (
						<div className="flex flex-col gap-1">
							<div className="mb-3 px-1">
								<p className="text-sm font-medium">{user.name}</p>
								<p className="text-xs text-muted-foreground">{user.email}</p>
							</div>
							<a
								href="/dashboard/my-recipes"
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<Heart className="h-4 w-4" />
								Moji recepti
							</a>
							<a
								href="/dashboard/my-courses"
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<BookOpen className="h-4 w-4" />
								Moji tečaji
							</a>
							<a
								href="/dashboard/my-orders"
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<ReceiptText className="h-4 w-4" />
								Moja naročila
							</a>
							<a
								href="/dashboard/settings"
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<Settings className="h-4 w-4" />
								Nastavitve
							</a>
							<button
								type="button"
								className="mt-2 flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
								onClick={async () => {
									await authClient.signOut();
									window.location.href = "/";
								}}
							>
								<LogOut className="h-4 w-4" />
								Odjava
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<Button asChild>
								<a href="/login">Prijava</a>
							</Button>
							<Button variant="outline" asChild>
								<a href="/register">Registracija</a>
							</Button>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
