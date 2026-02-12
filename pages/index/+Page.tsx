import { useData } from "vike-react/useData";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { CourseCard } from "@/components/courses/CourseCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { TravelCard } from "@/components/travel/TravelCard";
import { InstagramFeed } from "@/components/shared/InstagramFeed";
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
					<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
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

			{/* Courses Promo */}
			{data.courses && data.courses.length > 0 && (
				<section className="bg-amber-50/60 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-2 text-center">
							<h2 className="font-serif text-3xl font-bold">Video delavnice</h2>
							<p className="mt-2 text-muted-foreground">
								Korak za korakom te popeljem skozi pripravo najljubših jedi.
							</p>
						</div>
						<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.courses.map((course) => (
								<CourseCard
									key={course._id}
									title={course.title}
									description={course.description ?? ""}
									coverImage={course.coverImage}
									stepCount={course.stepCount}
									totalDuration={course.totalDuration}
									href={`/courses/${course.slug}`}
								/>
							))}
						</div>
						<div className="mt-8 text-center">
							<Button size="lg" variant="outline" asChild>
								<a href="/courses">Razišči delavnice</a>
							</Button>
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
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Blog */}
			{data.recentBlogPosts && data.recentBlogPosts.length > 0 && (
				<section className="bg-muted/50 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">Blog</h2>
							<Button variant="ghost" asChild>
								<a href="/blog">Preberi blog</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.recentBlogPosts.map((post) => (
								<BlogCard key={post._id} post={post} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Travel */}
			{data.recentTravelEntries && data.recentTravelEntries.length > 0 && (
				<section className="py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">Potovanja</h2>
							<Button variant="ghost" asChild>
								<a href="/travel">Vsa potovanja</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.recentTravelEntries.map((entry) => (
								<TravelCard key={entry._id} entry={entry} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Instagram */}
			<section className="bg-muted/50 py-16">
				<div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
					<h2 className="mb-6 text-center font-serif text-3xl font-bold">Instagram</h2>
					<InstagramFeed />
				</div>
			</section>

			{/* About CTA */}
			<section className="py-16">
				<div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-3xl font-bold">Spoznaj me</h2>
					<p className="mt-3 text-lg text-muted-foreground">
						Za kuharskimi recepti, potovanji in idejami stojim jaz — Eva. Preberi mojo
						zgodbo in se poveži z mano.
					</p>
					<div className="mt-6">
						<Button size="lg" variant="outline" asChild>
							<a href="/about">O meni</a>
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}
