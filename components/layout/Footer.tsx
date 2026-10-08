"use client";

import { CookieSettingsLink } from "@/components/shared/CookieConsent";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/react";

export function Footer() {
	const { t, l } = useI18n();

	return (
		<footer className="border-t border-border bg-muted/50">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-8 text-center md:mb-0 md:text-left">
					<span className="font-serif text-xl font-bold text-primary">{SITE_NAME}</span>
					<p className="mt-2 text-sm text-muted-foreground">{t("common.siteTagline")}</p>
				</div>
				<div className="mx-auto mt-8 max-w-xl text-center md:mx-0 md:text-left">
					<h3 className="font-semibold text-foreground">{t("common.newsletter.title")}</h3>
					<p className="mb-3 mt-1 text-sm text-muted-foreground">{t("common.newsletter.text")}</p>
					<div className="text-left">
						<NewsletterForm source="footer" />
					</div>
				</div>
				<div className="mt-6 grid grid-cols-2 gap-8 md:mt-8 md:grid-cols-3">
					<div className="col-span-2 hidden md:block" />
					<div className="col-span-1">
						<h3 className="font-semibold text-foreground">{t("common.footer.explore")}</h3>
						<nav className="mt-3 flex flex-col gap-2">
							{NAV_ITEMS.map((item) => (
								<a
									key={item.href}
									href={l(item.href)}
									className="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{t(`common.nav.${item.key}`)}
								</a>
							))}
						</nav>
					</div>
					<div className="col-span-1">
						<h3 className="font-semibold text-foreground">{t("common.footer.account")}</h3>
						<nav className="mt-3 flex flex-col gap-2">
							<a
								href={l("/login")}
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{t("common.footer.login")}
							</a>
							<a
								href={l("/register")}
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{t("common.footer.register")}
							</a>
							<a
								href={l("/dashboard/my-recipes")}
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{t("common.footer.myRecipes")}
							</a>
						</nav>
					</div>
				</div>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-8 text-sm text-muted-foreground">
					<a href={l("/privacy")} className="transition-colors hover:text-foreground">
						{t("common.footer.privacy")}
					</a>
					<a href={l("/terms")} className="transition-colors hover:text-foreground">
						{t("common.footer.terms")}
					</a>
					<CookieSettingsLink className="transition-colors hover:text-foreground" />
				</div>
				<div className="mt-4 text-center text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} {SITE_NAME}. {t("common.footer.rights")}
				</div>
			</div>
		</footer>
	);
}
