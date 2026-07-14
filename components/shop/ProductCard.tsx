import { BookOpen, Clock, ListChecks, Play } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { PriceDisplay } from "@/components/shop/PriceDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import type { Product } from "@/types/sanity";

const typeLabels: Record<string, string> = {
	ebook: "E-knjiga",
	ecourse: "E-tečaj",
	offline_course: "Tečaj v živo",
};

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	return (
		<a href={`/shop/${product.slug}`}>
			<Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-amber-300">
				<div className="relative aspect-[4/3] overflow-hidden">
					{product.coverImage ? (
						<OptimizedImage
							image={product.coverImage}
							alt={product.title}
							width={600}
							height={450}
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200" />
					)}
					{/* Type badge overlay */}
					<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
						{product.type === "ebook" && <BookOpen className="h-3.5 w-3.5" />}
						{product.type === "ecourse" && <Play className="h-3.5 w-3.5" />}
						{typeLabels[product.type] ?? product.type}
					</span>
				</div>
				<CardContent className="p-4">
					<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
						{product.title}
					</h3>
					{product.description && (
						<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
					)}

					{/* Course meta info */}
					{product.type === "ecourse" &&
						(product.courseStepCount != null ||
							(product.courseTotalDuration != null && product.courseTotalDuration > 0)) && (
							<div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
								{product.courseStepCount != null && (
									<span className="flex items-center gap-1">
										<ListChecks className="h-3.5 w-3.5" />
										{product.courseStepCount}{" "}
										{product.courseStepCount === 1
											? "korak"
											: product.courseStepCount === 2
												? "koraka"
												: product.courseStepCount <= 4
													? "koraki"
													: "korakov"}
									</span>
								)}
								{product.courseTotalDuration != null && product.courseTotalDuration > 0 && (
									<span className="flex items-center gap-1">
										<Clock className="h-3.5 w-3.5" />
										{formatDuration(product.courseTotalDuration)}
									</span>
								)}
							</div>
						)}

					<PriceDisplay
						priceInCents={product.priceInCents}
						currency={product.currency}
						className="mt-3 block text-lg font-bold text-primary"
					/>
				</CardContent>
			</Card>
		</a>
	);
}
