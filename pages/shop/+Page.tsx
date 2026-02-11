import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShoppingBag } from "lucide-react";
import type { Data } from "./+data";

export default function ShopPage() {
	const { products } = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Trgovina" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Trgovina</h1>
			<p className="mt-2 text-muted-foreground">
				E-knjige, tečaji in več za nadgradnjo tvojega kuhanja.
			</p>

			<div className="mt-8">
				{products.length === 0 ? (
					<div className="py-16 text-center">
						<ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
						<h2 className="mt-4 font-serif text-xl font-semibold text-muted-foreground">
							Izdelki še niso na voljo
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Pridno pripravljamo nove vsebine. Preveri kmalu!
						</p>
						<a
							href="/recipes"
							className="mt-6 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
						>
							Medtem razišči recepte →
						</a>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{products.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
