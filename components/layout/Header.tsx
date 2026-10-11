"use client";

import { usePageContext } from "vike-react/usePageContext";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { extractLocale } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "@/components/auth/UserMenu";
import { useI18n } from "@/lib/i18n/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
	const { t, l } = useI18n();
	const { path } = extractLocale(usePageContext().urlParsed.pathname);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-8">
					<a
						href={l("/")}
						className="font-serif text-2xl font-bold text-primary transition-opacity hover:opacity-80"
					>
						{SITE_NAME}
					</a>
					<nav className="hidden md:flex md:gap-6">
						{NAV_ITEMS.map((item) => {
							const active = path === item.href || path.startsWith(`${item.href}/`);
							return (
								<a
									key={item.href}
									href={l(item.href)}
									aria-current={active ? "page" : undefined}
									className={cn(
										"relative py-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300",
										active
											? "text-foreground after:scale-x-100"
											: "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
									)}
								>
									{t(`common.nav.${item.key}`)}
								</a>
							);
						})}
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
