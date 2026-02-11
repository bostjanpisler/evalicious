import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/shop/PriceDisplay";
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
			<Card className="group overflow-hidden transition-shadow hover:shadow-lg">
				{product.coverImage && (
					<div className="aspect-[4/3] overflow-hidden">
						<OptimizedImage
							image={product.coverImage}
							alt={product.title}
							width={600}
							height={450}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}
				<CardContent className="p-4">
					<Badge variant="secondary" className="mb-2 text-xs">
						{typeLabels[product.type] ?? product.type}
					</Badge>
					<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
						{product.title}
					</h3>
					{product.description && (
						<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
							{product.description}
						</p>
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
