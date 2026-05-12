import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

export function Footer() {
	return (
		<footer className="border-t border-border bg-muted/50">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-8 text-center md:mb-0 md:text-left">
					<span className="font-serif text-xl font-bold text-primary">{SITE_NAME}</span>
					<p className="mt-2 text-sm text-muted-foreground">
						Okusne jedi na rastlinski osnovi, knjižice z recepti, kuharski tečaji in delavnice ter
						raziskovanje sveta.
					</p>
				</div>
				<div className="mt-6 grid grid-cols-2 gap-8 md:mt-8 md:grid-cols-3">
					<div className="col-span-2 hidden md:block" />
					<div className="col-span-1">
						<h3 className="font-semibold text-foreground">Razišči</h3>
						<nav className="mt-3 flex flex-col gap-2">
							{NAV_ITEMS.map((item) => (
								<a
									key={item.href}
									href={item.href}
									className="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{item.label}
								</a>
							))}
						</nav>
					</div>
					<div className="col-span-1">
						<h3 className="font-semibold text-foreground">Račun</h3>
						<nav className="mt-3 flex flex-col gap-2">
							<a
								href="/login"
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								Prijava
							</a>
							<a
								href="/register"
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								Registracija
							</a>
							<a
								href="/dashboard/my-recipes"
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								Moji recepti
							</a>
						</nav>
					</div>
				</div>
				<div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} {SITE_NAME}. Vse pravice pridržane.
				</div>
			</div>
		</footer>
	);
}
