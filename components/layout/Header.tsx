"use client";

import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "@/components/auth/UserMenu";
import { useI18n } from "@/lib/i18n/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
	const { t, l } = useI18n();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-8">
					<a href={l("/")} className="font-serif text-2xl font-bold text-primary">
						{SITE_NAME}
					</a>
					<nav className="hidden md:flex md:gap-6">
						{NAV_ITEMS.map((item) => (
							<a
								key={item.href}
								href={l(item.href)}
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								{t(`common.nav.${item.key}`)}
							</a>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />
					<UserMenu />
					<div className="md:hidden">
						<MobileNav />
					</div>
				</div>
			</div>
		</header>
	);
}
