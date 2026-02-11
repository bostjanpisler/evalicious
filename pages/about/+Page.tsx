import { useData } from "vike-react/useData";
import { Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { Button } from "@/components/ui/button";
import type { Data } from "./+data";

const platformIcons: Record<string, string> = {
	instagram: "Instagram",
	twitter: "Twitter",
	youtube: "YouTube",
	tiktok: "TikTok",
	facebook: "Facebook",
	pinterest: "Pinterest",
};

export default function AboutPage() {
	const page = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "O meni" }]} />

			<div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Profile image */}
				<div>
					{page.profileImage && (
						<OptimizedImage
							image={page.profileImage}
							alt="O Evi"
							width={400}
							height={400}
							className="w-full rounded-xl object-cover"
							priority
						/>
					)}

					{/* Social links */}
					{page.socialLinks && page.socialLinks.length > 0 && (
						<div className="mt-6 space-y-2">
							{page.socialLinks.map((link) => (
								<a
									key={link.platform}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									<span className="font-medium">
										{platformIcons[link.platform] ?? link.platform}
									</span>
								</a>
							))}
						</div>
					)}

					{/* Contact email */}
					{page.contactEmail && (
						<a
							href={`mailto:${page.contactEmail}`}
							className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							<Mail className="h-4 w-4" />
							{page.contactEmail}
						</a>
					)}
				</div>

				{/* Bio */}
				<div className="lg:col-span-2">
					<h1 className="font-serif text-4xl font-bold">O meni</h1>
					{page.bio && (
						<div className="mt-6">
							<PortableTextRenderer value={page.bio} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
