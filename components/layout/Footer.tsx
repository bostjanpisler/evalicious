import { SITE_NAME, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
	return (
		<footer className="border-t border-border bg-muted/50">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					<div>
						<span className="font-serif text-xl font-bold text-primary">{SITE_NAME}</span>
						<p className="mt-2 text-sm text-muted-foreground">
							Okusni recepti iz Evine kuhinje.
						</p>
					</div>
					<div>
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
					<div>
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
