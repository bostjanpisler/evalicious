import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { PriceDisplay } from "@/components/shop/PriceDisplay";
import { BuyButton } from "@/components/shop/BuyButton";
import {
	PortableTextRenderer,
} from "@/components/blog/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Data } from "./+data";

const typeLabels: Record<string, string> = {
	ebook: "E-Book",
	ecourse: "E-Course",
	offline_course: "Offline Course",
};

export default function ProductPage() {
	const product = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[{ label: "Shop", href: "/shop" }, { label: product.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
				{/* Image */}
				<div>
					{product.coverImage && (
						<OptimizedImage
							image={product.coverImage}
							alt={product.title}
							width={700}
							height={525}
							className="w-full rounded-xl object-cover"
							priority
						/>
					)}
				</div>

				{/* Details */}
				<div>
					<Badge variant="secondary" className="capitalize">
						{typeLabels[product.type] ?? product.type}
					</Badge>

					<h1 className="mt-3 font-serif text-4xl font-bold">{product.title}</h1>

					{product.description && (
						<p className="mt-3 text-lg text-muted-foreground">
							{product.description}
						</p>
					)}

					<PriceDisplay
						priceInCents={product.priceInCents}
						currency={product.currency}
						className="mt-4 block text-3xl font-bold text-primary"
					/>

					<BuyButton productId={product._id} className="mt-6" />

					{product.tags && product.tags.length > 0 && (
						<div className="mt-6 flex flex-wrap gap-2">
							{product.tags.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Long description */}
			{product.longDescription && (
				<>
					<Separator className="my-10" />
					<div className="mx-auto max-w-3xl">
						<PortableTextRenderer value={product.longDescription} />
					</div>
				</>
			)}
		</div>
	);
}
