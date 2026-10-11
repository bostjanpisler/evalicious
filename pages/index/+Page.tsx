import { useData } from "vike-react/useData";
import { BlogCard } from "@/components/blog/BlogCard";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { InstagramFeed } from "@/components/shared/InstagramFeed";
import { JsonLd } from "@/components/shared/JsonLd";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { TravelCard } from "@/components/travel/TravelCard";
import { Button } from "@/components/ui/button";
import { HOMEPAGE_CATEGORIES, SITE_URL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/react";
import { siteJsonLd } from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import type { Data } from "./+data";

const CATEGORY_ICONS: Record<string, string> = {
	breakfast: "🥣",
	main: "🍽️",
	sides: "🥗",
	snack: "🥨",
	dessert: "🍰",
	drink: "🥤",
};

const SERVICES = [
	{ key: "sponsored", icon: "📸" },
	{ key: "ugc", icon: "🎬" },
	{ key: "recipeDev", icon: "🍽️" },
] as const;

export default function HomePage() {
	const data = useData<Data>();
	const { t, l, locale } = useI18n();

	const [featuredHero, ...featuredRest] = data.featuredRecipes ?? [];

	return (
		<>
			<JsonLd
				data={siteJsonLd({ origin: SITE_URL, locale, description: t("common.siteDescription") })}
			/>
			{/* Hero Section */}
			<section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden bg-muted">
				{data.heroImage && (
					<div className="absolute inset-0 bg-neutral-900">
						<OptimizedImage
							image={data.heroImage}
							alt={t("home.hero.imageAlt")}
							width={1600}
							className="h-full w-full object-cover"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
					</div>
				)}
				<div
					className={cn(
						"relative z-10 mx-auto max-w-3xl px-4 text-center",
						data.heroImage && "text-white",
					)}
				>
					<h1 className="font-serif text-5xl font-bold tracking-tight drop-shadow-sm sm:text-7xl">
						{data.heroTitle ?? "Eva-licious"}
					</h1>
					<span aria-hidden className="mx-auto mt-5 block h-0.5 w-16 rounded-full bg-primary" />
					<p
						className={cn(
							"mt-5 text-lg sm:text-xl",
							data.heroImage ? "text-white/90" : "text-muted-foreground",
						)}
					>
						{data.heroSubtitle ?? t("home.hero.subtitle")}
					</p>
					<div className="mt-8">
						<Button size="lg" className="rounded-full px-8 shadow-lg" asChild>
							<a href={l("/recipes")}>{t("home.hero.cta")}</a>
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
								href={l(`/recipes?category=${cat}`)}
								className="group flex flex-col items-center gap-3 rounded-2xl px-3 py-4 transition-colors hover:bg-muted"
							>
								<span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-primary/25 sm:h-16 sm:w-16 sm:text-3xl">
									{CATEGORY_ICONS[cat]}
								</span>
								<span className="text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
									{t(`home.categories.${cat}`)}
								</span>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* Recent Recipes */}
			{data.recentRecipes && data.recentRecipes.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<SectionHeader
						title={t("home.recent.title")}
						href={l("/recipes")}
						linkLabel={t("home.seeAll")}
					/>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{data.recentRecipes.map((recipe) => (
							<RecipeCard key={recipe._id} recipe={recipe} />
						))}
					</div>
					<div className="mt-10 text-center">
						<Button size="lg" variant="outline" className="rounded-full px-8" asChild>
							<a href={l("/recipes")}>{t("home.recent.seeAllRecipes")}</a>
						</Button>
					</div>
				</section>
			)}

			{/* Featured Recipes — hero layout */}
			{featuredHero && (
				<section className="bg-muted/50 py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<SectionHeader
							title={t("home.featured.title")}
							href={l("/recipes")}
							linkLabel={t("home.seeAll")}
						/>
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{/* Hero card */}
							<a href={l(`/recipes/${featuredHero.slug}`)} className="group">
								<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
									{featuredHero.coverImage && (
										<div className="aspect-[3/2] overflow-hidden">
											<OptimizedImage
												image={featuredHero.coverImage}
												alt={featuredHero.title}
												width={800}
												height={533}
												className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
											href={l(`/recipes/${recipe.slug}`)}
											className="group flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
										>
											{recipe.coverImage && (
												<div className="aspect-square w-32 shrink-0 overflow-hidden sm:w-40">
													<OptimizedImage
														image={recipe.coverImage}
														alt={recipe.title}
														width={320}
														height={320}
														className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
					<SectionHeader
						title={t("home.blog.title")}
						href={l("/blog")}
						linkLabel={t("home.seeAll")}
					/>
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
						<SectionHeader
							title={t("home.travel.title")}
							href={l("/travel")}
							linkLabel={t("home.seeAll")}
						/>
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
					<SectionHeader
						title={t("home.shop.title")}
						href={l("/shop")}
						linkLabel={t("home.seeAll")}
					/>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{data.featuredProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
				</section>
			)}

			{/* Newsletter */}
			<section id="newsletter" className="scroll-mt-20 bg-muted/50 py-16">
				<div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-3xl font-bold">{t("common.newsletter.title")}</h2>
					<p className="mb-6 mt-3 text-sm text-muted-foreground">{t("common.newsletter.text")}</p>
					<div className="text-left">
						<NewsletterForm source="home" />
					</div>
				</div>
			</section>

			{/* Instagram */}
			<section className="py-16">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<SectionHeader title={t("home.instagram.title")} align="center" className="mb-6" />
					<InstagramFeed variant="wide" profileImage={data.profileImage} />
				</div>
			</section>

			{/* About CTA */}
			<section className="bg-muted/50 py-16">
				<div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="font-serif text-3xl font-bold">{t("home.about.title")}</h2>
					<p className="mx-auto mt-4 max-w-3xl leading-relaxed text-muted-foreground">
						{t("home.about.text")}
					</p>
					<div className="mt-6">
						<Button size="lg" variant="outline" className="rounded-full px-8" asChild>
							<a href={l("/about")}>{t("home.about.cta")}</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Services */}
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<SectionHeader title={t("home.services.title")} align="center" className="mb-4" />
					<p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
						{t("home.services.intro")}
					</p>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						{SERVICES.map(({ key, icon }) => (
							<div
								key={key}
								className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
							>
								<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
									{icon}
								</span>
								<h3 className="mt-3 font-serif text-lg font-semibold">
									{t(`home.services.${key}.title`)}
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									{t(`home.services.${key}.text`)}
								</p>
							</div>
						))}
					</div>
					<div className="mt-10 text-center">
						<Button size="lg" className="rounded-full px-8" asChild>
							<a href="mailto:evasusin97@gmail.com">{t("home.services.cta")}</a>
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}
