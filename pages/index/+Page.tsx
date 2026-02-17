import { useData } from "vike-react/useData";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { TravelCard } from "@/components/travel/TravelCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { InstagramFeed } from "@/components/shared/InstagramFeed";
import { Button } from "@/components/ui/button";
import {
	HOMEPAGE_CATEGORIES,
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
						{HOMEPAGE_CATEGORIES.map((cat) => (
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

			{/* Recent Blog Posts */}
			{data.recentBlogPosts && data.recentBlogPosts.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="font-serif text-3xl font-bold">Zadnje z bloga</h2>
						<Button variant="ghost" asChild>
							<a href="/blog">Poglej vse</a>
						</Button>
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{data.recentBlogPosts.map((post) => (
							<BlogCard key={post._id} post={post} />
						))}
					</div>
				</section>
			)}

			{/* Recent Travel Entries */}
			{data.recentTravelEntries && data.recentTravelEntries.length > 0 && (
				<section className="bg-muted/50 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-3xl font-bold">
								Potovanja
							</h2>
							<Button variant="ghost" asChild>
								<a href="/travel">Poglej vse</a>
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

			{/* Featured Products */}
			{data.featuredProducts && data.featuredProducts.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="font-serif text-3xl font-bold">Trgovina</h2>
						<Button variant="ghost" asChild>
							<a href="/shop">Poglej vse</a>
						</Button>
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{data.featuredProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
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
						Vesela sem vsake priložnosti, kjer lahko odkrivam nove okuse,
						spoznavam izdelke in ustvarjam avtentično vsebino. Če imate idejo
						za sodelovanje, iščete sveže ideje, fotografije ali UGC vsebine,
						ste na pravem mestu.
					</p>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">📸</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								Sponzorirane objave
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Promocija vaših izdelkov in storitev na mojem Instagram profilu, s
								skupnostjo preko 10k sledilci.
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">🎬</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								UGC vsebine
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Avtentične vsebine za vaše organske profile, spletne strani ali
								oglase (možnosti tudi sponsorship ads in dark post).
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
							<span className="text-3xl">🍽️</span>
							<h3 className="mt-3 font-serif text-lg font-semibold">
								Razvoj receptov & fotografija
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Uživam v kreiranju novih receptov in še bolj v tem, da jih
								prikažem v najlepši obliki - video ali foto. Za vas lahko
								ustvarim recepte za vaše spletne strani, socialna omrežja ali
								tiskovine.
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
				<div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-3xl font-bold">Spoznaj me</h2>
					<p className="mt-3 text-sm text-muted-foreground">
						Hej, sem Eva ✌️ Ustvarjalka, ki verjame, da lahko vsakdanje
						življenje postane lepše in okusnejše, če vanj dodamo kanček
						ustvarjalnosti, zdravih navad in pozitivne energije. Ta blog sem
						ustvarila za vse, ki radi kuhajo, potujejo, raziskujejo nove ideje
						in iščejo navdih za bolj uravnotežen življenjski slog. Vsak
						projekt, ki ga sprejemem, poskušam obogatiti z osebno noto in
						avtentičnostjo, ki odraža moj pristop do kuhanja, življenja in
						pripovedovanja zgodb. Hvala, da si del moje skupnosti ☀️
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
