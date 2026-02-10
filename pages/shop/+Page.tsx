import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Data } from "./+data";

export default function ShopPage() {
	const { products } = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Shop" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Shop</h1>
			<p className="mt-2 text-muted-foreground">
				E-books, courses, and more to level up your cooking.
			</p>

			<div className="mt-8">
				{products.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						No products available yet. Check back soon!
					</p>
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
