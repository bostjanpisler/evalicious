import { useData } from "vike-react/useData";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { InstagramFeed } from "@/components/shared/InstagramFeed";
import { Button } from "@/components/ui/button";
import {
	RECIPE_CATEGORIES,
	RECIPE_CATEGORY_LABELS,
} from "@/lib/constants";
import type { Data } from "./+data";

const CATEGORY_ICONS: Record<string, string> = {
	breakfast: "🥣",
	main: "🍽️",
	sides: "🥗",
	snack: "🥨",
	dessert: "🍰",
	drink: "🥤",
};

export default function HomePage() {
	const data = useData<Data>();

	const [featuredHero, ...featuredRest] = data.featuredRecipes ?? [];

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
						{data.heroTitle ?? "Eva-licious"}
					</h1>
					<p className="mt-4 text-xl text-muted-foreground">
						{data.heroSubtitle ?? "Okusne jedi na rastlinski osnovi, knjižice z recepti, kuharski tečaji in delavnice ter raziskovanje sveta z Evo."}
					</p>
					<div className="mt-8">
						<Button size="lg" asChild>
							<a href="/recipes">Razišči recepte</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Category Browse */}
			<section className="border-b border-border">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
						{RECIPE_CATEGORIES.map((cat) => (
							<a
								key={cat}
								href={`/recipes?category=${cat}`}
								className="group flex flex-col items-center gap-2 rounded-xl px-3 py-4 transition-colors hover:bg-muted"
							>
								<span className="text-2xl sm:text-3xl">
									{CATEGORY_ICONS[cat]}
								</span>
								<span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
									{RECIPE_CATEGORY_LABELS[cat]}
								</span>
							</a>
						))}
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
					<div className="mt-10 text-center">
						<Button size="lg" variant="outline" asChild>
							<a href="/recipes">Poglej vse recepte</a>
						</Button>
					</div>
				</section>
			)}

			{/* Featured Recipes — hero layout */}
			{featuredHero && (
				<section className="bg-muted/50 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">Izpostavljeni recepti</h2>
							<Button variant="ghost" asChild>
								<a href="/recipes">Poglej vse</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{/* Hero card */}
							<a href={`/recipes/${featuredHero.slug}`} className="group">
								<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
									{featuredHero.coverImage && (
										<div className="aspect-[3/2] overflow-hidden">
											<OptimizedImage
												image={featuredHero.coverImage}
												alt={featuredHero.title}
												width={800}
												height={533}
												className="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
										</div>
									)}
									<div className="p-5">
										<h3 className="font-serif text-2xl font-semibold leading-tight group-hover:text-primary">
											{featuredHero.title}
										</h3>
									</div>
								</div>
							</a>
							{/* Side cards */}
							{featuredRest.length > 0 && (
								<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
									{featuredRest.slice(0, 2).map((recipe) => (
										<a
											key={recipe._id}
											href={`/recipes/${recipe.slug}`}
											className="group flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
										>
											{recipe.coverImage && (
												<div className="aspect-square w-32 shrink-0 overflow-hidden sm:w-40">
													<OptimizedImage
														image={recipe.coverImage}
														alt={recipe.title}
														width={320}
														height={320}
														className="h-full w-full object-cover transition-transform group-hover:scale-105"
													/>
												</div>
											)}
											<div className="flex items-center p-4">
												<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
													{recipe.title}
												</h3>
											</div>
										</a>
									))}
								</div>
							)}
						</div>
					</div>
				</section>
			)}

			{/* Instagram */}
			<section className="py-16">
				<div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
					<h2 className="mb-6 text-center font-serif text-3xl font-bold">Instagram</h2>
					<InstagramFeed />
				</div>
			</section>

			{/* Services */}
			<section className="bg-muted/50 py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<h2 className="mb-3 text-center font-serif text-3xl font-bold">
						Storitve
					</h2>
					<p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
						Sodelujem z blagovnimi znamkami, ki delijo mojo strast do zdrave in
						okusne hrane.
					</p>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">📸</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								Sponzorirane vsebine
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Recepti z vašim izdelkom na blogu, Instagram objavah in TikTok
								videih.
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">🎬</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								UGC vsebine
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Originalne vsebine za vaše kanale — unboxing, pričevanja,
								izobraževalni videi.
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">🍽️</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								Razvoj receptov & fotografija
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Razvoj novih receptov in profesionalna food fotografija za
								splet, tisk ali embalaže.
							</p>
						</div>
					</div>
					<div className="mt-10 text-center">
						<Button size="lg" asChild>
							<a href="mailto:evasusin97@gmail.com">Pošlji povpraševanje</a>
						</Button>
					</div>
				</div>
			</section>

			{/* About CTA */}
			<section className="py-16">
				<div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-3xl font-bold">Spoznaj me</h2>
					<p className="mt-3 text-lg text-muted-foreground">
						Za kuharskimi recepti in idejami stojim jaz — Eva. Preberi mojo
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
