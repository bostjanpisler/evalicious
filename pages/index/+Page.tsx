import { useData } from "vike-react/useData";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Button } from "@/components/ui/button";
import type { Data } from "./+data";

export default function HomePage() {
	const data = useData<Data>();

	return (
		<>
			{/* Hero Section */}
			<section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-muted">
				{data.heroImage && (
					<div className="absolute inset-0">
						<OptimizedImage
							image={data.heroImage}
							alt="Hero"
							width={1600}
							className="h-full w-full object-cover opacity-30 dark:opacity-20"
							priority
						/>
					</div>
				)}
				<div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
					<h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
						{data.heroTitle ?? "Eva-Licious"}
					</h1>
					<p className="mt-4 text-xl text-muted-foreground">
						{data.heroSubtitle ?? "Recepti, življenjski slog, potovanja in več."}
					</p>
					<div className="mt-8 flex justify-center gap-4">
						<Button size="lg" asChild>
							<a href="/recipes">Razišči recepte</a>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<a href="/shop">Obišči trgovino</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Recent Recipes */}
			{data.recentRecipes && data.recentRecipes.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="font-serif text-3xl font-bold">Najnovejši recepti</h2>
						<Button variant="ghost" asChild>
							<a href="/recipes">Poglej vse</a>
						</Button>
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{data.recentRecipes.map((recipe) => (
							<RecipeCard key={recipe._id} recipe={recipe} />
						))}
					</div>
				</section>
			)}

			{/* Featured Recipes */}
			{data.featuredRecipes && data.featuredRecipes.length > 0 && (
				<section className="bg-muted/50 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">Izpostavljeni recepti</h2>
							<Button variant="ghost" asChild>
								<a href="/recipes">Poglej vse</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.featuredRecipes.map((recipe) => (
								<RecipeCard
									key={recipe._id}
									recipe={{ ...recipe, slug: recipe.slug }}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Featured Products */}
			{data.featuredProducts && data.featuredProducts.length > 0 && (
				<section className="py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">Iz trgovine</h2>
							<Button variant="ghost" asChild>
								<a href="/shop">Poglej vse</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.featuredProducts.map((product) => (
								<a
									key={product._id}
									href={`/shop/${product.slug}`}
									className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
								>
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
									<div className="p-4">
										<h3 className="font-serif text-lg font-semibold group-hover:text-primary">
											{product.title}
										</h3>
										<p className="mt-1 text-sm font-medium text-primary">
											{new Intl.NumberFormat("sl-SI", {
												style: "currency",
												currency: "EUR",
											}).format(product.priceInCents / 100)}
										</p>
									</div>
								</a>
							))}
						</div>
					</div>
				</section>
			)}
		</>
	);
}
