import { Instagram, Facebook, Youtube } from "lucide-react";
import { InstagramFeed } from "@/components/shared/InstagramFeed";

const SOCIAL_LINKS = [
	{
		name: "Instagram",
		href: "https://www.instagram.com/susiiiiin/",
		icon: Instagram,
	},
	{
		name: "TikTok",
		href: "https://www.tiktok.com/@evasusin",
		icon: () => (
			<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
				<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.65a8.35 8.35 0 0 0 4.76 1.49V6.69h-1z" />
			</svg>
		),
	},
	{
		name: "YouTube",
		href: "https://www.youtube.com/@evasusin",
		icon: Youtube,
	},
	{
		name: "Facebook",
		href: "https://www.facebook.com/evasusiin",
		icon: Facebook,
	},
];

export function ProfileSidebar() {
	return (
		<div className="space-y-6">
			{/* About widget */}
			<div className="rounded-lg border border-border bg-card p-5 text-center">
				<h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
					Dobrodošli
				</h3>
				<img
					src="https://eva-licious.com/wp-content/uploads/2024/07/Untitled-design-4.png"
					alt="Eva Susin"
					width={120}
					height={120}
					className="mx-auto rounded-full object-cover"
					loading="lazy"
				/>
				<h4 className="mt-3 font-serif text-lg font-semibold">Eva Susin</h4>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					Od kuharskih delavnic do raziskovanja veganskih kotičkov po svetu — hrana
					je moja največja strast in združuje vse moje interese. Če potrebuješ
					inspiracijo za naslednji obrok, pobrskaj po blogu.
				</p>

				{/* Social links */}
				<div className="mt-4 flex justify-center gap-3">
					{SOCIAL_LINKS.map((link) => (
						<a
							key={link.name}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							title={link.name}
							className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
						>
							<link.icon className="h-5 w-5" />
						</a>
					))}
				</div>
			</div>

			{/* Instagram feed */}
			<InstagramFeed />
		</div>
	);
}
