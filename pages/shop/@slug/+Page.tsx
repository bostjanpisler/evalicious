import { useData } from "vike-react/useData";
import { useConfig } from "vike-react/useConfig";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { PriceDisplay } from "@/components/shop/PriceDisplay";
import { BuyButton } from "@/components/shop/BuyButton";
import {
	PortableTextRenderer,
} from "@/components/blog/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/utils";
import { urlFor } from "@/lib/sanity.image";
import type { Data } from "./+data.server";
import { BookOpen, CheckCircle, Download, Play, Clock, ListChecks } from "lucide-react";

const typeLabels: Record<string, string> = {
	ebook: "E-knjiga",
	ecourse: "E-tečaj",
	offline_course: "Tečaj v živo",
};

export default function ProductPage() {
	const product = useData<Data>();
	const config = useConfig();
	config({
		title: `${product.title} | Eva-licious`,
		description: product.description,
		image: product.coverImage
			? urlFor(product.coverImage).width(1200).height(630).auto("format").url()
			: undefined,
	});

	return (
		<>
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[{ label: "Trgovina", href: "/shop" }, { label: product.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Image — takes 2 cols */}
				<div className="lg:col-span-2">
					{product.coverImage ? (
						<OptimizedImage
							image={product.coverImage}
							alt={product.title}
							width={800}
							height={500}
							className="w-full rounded-xl object-cover"
							priority
						/>
					) : (
						<div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-amber-100 to-amber-200" />
					)}

					{/* Long description */}
					{product.longDescription && (
						<div className="mt-10">
							<PortableTextRenderer value={product.longDescription} />
						</div>
					)}
				</div>

				{/* Sticky sidebar */}
				<div className="lg:col-span-1">
					<div className="sticky top-24 space-y-5">
						<Badge variant="secondary" className="gap-1.5">
							{product.type === "ebook" && <BookOpen className="h-3.5 w-3.5" />}
							{product.type === "ecourse" && <Play className="h-3.5 w-3.5" />}
							{typeLabels[product.type] ?? product.type}
						</Badge>

						<h1 className="font-serif text-3xl font-bold leading-tight">
							{product.title}
						</h1>

						{product.description && (
							<p className="text-muted-foreground">{product.description}</p>
						)}

						{/* Ebook-specific info */}
						{product.type === "ebook" && (
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline" className="gap-1">
									<Download className="h-3 w-3" />
									PDF
								</Badge>
								<Badge variant="outline" className="gap-1">
									Takojšnji prenos
								</Badge>
							</div>
						)}

						{/* Ecourse-specific info */}
						{product.type === "ecourse" && product.course && (
							<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
								<h3 className="text-sm font-semibold">Vsebina tečaja</h3>
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									{product.course.stepCount != null && (
										<span className="flex items-center gap-1.5">
											<ListChecks className="h-4 w-4" />
											{product.course.stepCount}{" "}
											{product.course.stepCount === 1
												? "korak"
												: product.course.stepCount === 2
													? "koraka"
													: product.course.stepCount <= 4
														? "koraki"
														: "korakov"}
										</span>
									)}
									{product.course.totalDuration != null && product.course.totalDuration > 0 && (
										<span className="flex items-center gap-1.5">
											<Clock className="h-4 w-4" />
											{formatDuration(product.course.totalDuration)}
										</span>
									)}
								</div>
								{product.course.description && (
									<p className="text-sm text-muted-foreground line-clamp-3">
										{product.course.description}
									</p>
								)}
							</div>
						)}

						<PriceDisplay
							priceInCents={product.priceInCents}
							currency={product.currency}
							className="block text-3xl font-bold text-primary"
						/>

						{/* Buy / owned state */}
						{product.owned ? (
							<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
								<div className="flex items-center justify-center gap-2 text-green-700">
									<CheckCircle className="h-5 w-5" />
									<span className="font-semibold">Že kupljeno</span>
								</div>
								{product.ownershipTarget && (
									<a href={product.ownershipTarget}>
										<Button variant="outline" className="mt-3 w-full">
											{product.type === "ecourse"
												? "Pojdi na tečaj"
												: "Moja naročila"}
										</Button>
									</a>
								)}
							</div>
						) : (
							<BuyButton productSlug={product.slug} />
						)}

						{product.tags && product.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 pt-2">
								{product.tags.map((tag) => (
									<Badge key={tag} variant="outline">
										{tag}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>

			{/* Mobile fixed buy bar */}
			{!product.owned && (
				<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
					<div className="mx-auto flex max-w-7xl items-center gap-3">
						<PriceDisplay
							priceInCents={product.priceInCents}
							currency={product.currency}
							className="text-xl font-bold text-primary"
						/>
						<BuyButton productSlug={product.slug} className="flex-1" />
					</div>
				</div>
			)}
		</>
	);
}
