import { Mail } from "lucide-react";
import { useData } from "vike-react/useData";
import { PortableTextRenderer } from "@/components/blog/PortableTextRenderer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
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

	const hasSections = page.sections && page.sections.length > 0;

	return (
		<div>
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Breadcrumbs segments={[{ label: "O meni" }]} />
				<h1 className="mt-4 font-serif text-4xl font-bold">{page.title ?? "O meni"}</h1>
			</div>

			{/* Sections with alternating backgrounds */}
			{hasSections ? (
				page.sections?.map((section, index) => {
					const isEven = index % 2 === 0;
					const imageLeft = index % 2 === 0;

					return (
						<section
							key={section.heading ?? index}
							className={isEven ? "bg-background" : "bg-muted/50"}
						>
							<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
								<div
									className={`flex flex-col items-center gap-10 lg:flex-row ${
										imageLeft ? "" : "lg:flex-row-reverse"
									}`}
								>
									{/* Image */}
									{section.image && (
										<div className="w-full shrink-0 lg:w-2/5">
											<div className="aspect-square overflow-hidden rounded-2xl">
												<OptimizedImage
													image={section.image}
													alt={section.heading ?? ""}
													width={500}
													height={500}
													className="h-full w-full object-cover"
												/>
											</div>
										</div>
									)}

									{/* Text */}
									<div className="flex-1">
										{section.heading && (
											<h2 className="mb-4 font-serif text-2xl font-bold">{section.heading}</h2>
										)}
										{section.text && (
											<div className="prose prose-sm max-w-none text-muted-foreground">
												<PortableTextRenderer value={section.text} />
											</div>
										)}
									</div>
								</div>
							</div>
						</section>
					);
				})
			) : (
				/* Fallback: legacy layout with bio + profile image */
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
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
						</div>
						<div className="lg:col-span-2">
							{page.bio && (
								<div className="mt-6">
									<PortableTextRenderer value={page.bio} />
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Contact & Social footer */}
			<section className="border-t border-border bg-muted/30 py-16">
				<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-2xl font-bold">Povežimo se</h2>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-4">
						{page.socialLinks?.map((link) => (
							<a
								key={link.platform}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
							>
								{platformIcons[link.platform] ?? link.platform}
							</a>
						))}
						{page.contactEmail && (
							<Button variant="outline" asChild className="rounded-full">
								<a href={`mailto:${page.contactEmail}`}>
									<Mail className="mr-2 h-4 w-4" />
									{page.contactEmail}
								</a>
							</Button>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
