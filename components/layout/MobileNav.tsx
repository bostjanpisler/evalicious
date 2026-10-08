"use client";

import { BookOpen, Heart, LogOut, Menu, ReceiptText, Settings } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/react";

export function MobileNav() {
	const pageContext = usePageContext();
	const user = pageContext.user;
	const { t, l } = useI18n();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={t("common.menu.open")}>
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
							href={l(item.href)}
							className="text-lg font-medium text-foreground transition-colors hover:text-primary"
						>
							{t(`common.nav.${item.key}`)}
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
								href={l("/dashboard/my-recipes")}
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<Heart className="h-4 w-4" />
								{t("common.menu.myRecipes")}
							</a>
							<a
								href={l("/dashboard/my-courses")}
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<BookOpen className="h-4 w-4" />
								{t("common.menu.myCourses")}
							</a>
							<a
								href={l("/dashboard/my-orders")}
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<ReceiptText className="h-4 w-4" />
								{t("common.menu.myOrders")}
							</a>
							<a
								href={l("/dashboard/settings")}
								className="flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
							>
								<Settings className="h-4 w-4" />
								{t("common.menu.settings")}
							</a>
							<button
								type="button"
								className="mt-2 flex items-center gap-3 rounded-md px-1 py-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
								onClick={async () => {
									await authClient.signOut();
									window.location.href = l("/");
								}}
							>
								<LogOut className="h-4 w-4" />
								{t("common.menu.logout")}
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<Button asChild>
								<a href={l("/login")}>{t("common.menu.login")}</a>
							</Button>
							<Button variant="outline" asChild>
								<a href={l("/register")}>{t("common.menu.register")}</a>
							</Button>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
