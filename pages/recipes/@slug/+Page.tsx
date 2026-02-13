import { useData } from "vike-react/useData";
import { useConfig } from "vike-react/useConfig";
import { Clock, Users, ChefHat, Flame } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { ProfileSidebar } from "@/components/shared/ProfileSidebar";
import { IngredientChecklist } from "@/components/recipes/IngredientChecklist";
import { StepChecklist } from "@/components/recipes/StepChecklist";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { SaveRecipeButton } from "@/components/recipes/SaveRecipeButton";
import { AddToListDialog } from "@/components/recipes/AddToListDialog";
import { TableOfContents } from "@/components/blog/TableOfContents";
import {
	PortableTextRenderer,
	extractHeadings,
} from "@/components/blog/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/utils";
import { urlFor } from "@/lib/sanity.image";
import { RECIPE_CATEGORY_LABELS, RECIPE_DIFFICULTY_LABELS } from "@/lib/constants";
import type { Data } from "./+data";

export default function RecipePage() {
	const recipe = useData<Data>();
	const config = useConfig();
	config({
		title: `${recipe.title} | Eva-Licious`,
		description: recipe.description ?? `Recept: ${recipe.title}`,
		image: recipe.coverImage
			? urlFor(recipe.coverImage).width(1200).height(630).auto("format").url()
			: undefined,
	});
	const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

	// Build combined TOC headings
	const hasContent = recipe.content && recipe.content.length > 0;
	const introHeadings = hasContent
		? [{ key: "o-receptu", text: "O receptu", level: 2 }]
		: [];
	const contentHeadings = hasContent ? extractHeadings(recipe.content) : [];
	const sectionHeadings = [
		{ key: "recept", text: "Recept", level: 2 },
		{ key: "sestavine", text: "Sestavine", level: 3 },
		{ key: "navodila", text: "Navodila", level: 3 },
	];
	const relatedHeadings =
		recipe.relatedRecipes && recipe.relatedRecipes.length > 0
			? [{ key: "podobni-recepti", text: "Podobni recepti", level: 2 }]
			: [];
	const allHeadings = [
		...introHeadings,
		...contentHeadings,
		...sectionHeadings,
		...relatedHeadings,
	];

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[{ label: "Recepti", href: "/recipes" }, { label: recipe.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Main content */}
				<div className="lg:col-span-2">
					{/* Title and description */}
					<h1 className="font-serif text-4xl font-bold">{recipe.title}</h1>
					{recipe.description && (
						<p className="mt-3 text-lg text-muted-foreground">{recipe.description}</p>
					)}

					<div className="mt-4 flex items-center gap-2">
						<SaveRecipeButton recipeId={recipe._id} />
						<AddToListDialog contentType="recipe" contentId={recipe._id} />
					</div>

					{/* Story content */}
					{hasContent && (
						<>
							<Separator className="my-8" />
							<h2
								id="o-receptu"
								className="mb-6 scroll-mt-24 font-serif text-2xl font-bold"
							>
								O receptu
							</h2>
							<PortableTextRenderer value={recipe.content} />
						</>
					)}

					{/* Recipe card */}
					<div className="my-8 rounded-xl border border-border bg-card p-6">
						<h2
							id="recept"
							className="scroll-mt-24 font-serif text-2xl font-bold"
						>
							Recept
						</h2>

						<div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
							{recipe.prepTime != null && recipe.prepTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Clock className="h-4 w-4" />
									Priprava: {formatDuration(recipe.prepTime)}
								</span>
							)}
							{recipe.cookTime != null && recipe.cookTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Flame className="h-4 w-4" />
									Kuhanje: {formatDuration(recipe.cookTime)}
								</span>
							)}
							{totalTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Clock className="h-4 w-4" />
									Skupaj: {formatDuration(totalTime)}
								</span>
							)}
							{recipe.servings != null && (
								<span className="flex items-center gap-1.5">
									<Users className="h-4 w-4" />
									{recipe.servings} {recipe.servings === 1 ? "porcija" : "porcij"}
								</span>
							)}
							{recipe.cuisine && (
								<span className="flex items-center gap-1.5">
									<ChefHat className="h-4 w-4" />
									{recipe.cuisine}
								</span>
							)}
						</div>

						{/* Tags */}
						<div className="mt-4 flex flex-wrap items-start gap-2">
							{recipe.category && (
								<Badge variant="secondary">
									{RECIPE_CATEGORY_LABELS[recipe.category] ?? recipe.category}
								</Badge>
							)}
							{recipe.difficulty && (
								<Badge variant="outline">
									{RECIPE_DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
								</Badge>
							)}
							{recipe.tags?.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>

						{/* Nutrition */}
						{recipe.nutritionInfo && (
							<>
								<Separator className="my-6" />
								<div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-center sm:grid-cols-4">
									{recipe.nutritionInfo.calories != null && (
										<div>
											<p className="text-2xl font-bold">{recipe.nutritionInfo.calories}</p>
											<p className="text-xs text-muted-foreground">Kalorije</p>
										</div>
									)}
									{recipe.nutritionInfo.protein != null && (
										<div>
											<p className="text-2xl font-bold">{recipe.nutritionInfo.protein}g</p>
											<p className="text-xs text-muted-foreground">Beljakovine</p>
										</div>
									)}
									{recipe.nutritionInfo.fat != null && (
										<div>
											<p className="text-2xl font-bold">{recipe.nutritionInfo.fat}g</p>
											<p className="text-xs text-muted-foreground">Maščobe</p>
										</div>
									)}
									{recipe.nutritionInfo.carbs != null && (
										<div>
											<p className="text-2xl font-bold">{recipe.nutritionInfo.carbs}g</p>
											<p className="text-xs text-muted-foreground">Ogljikovi hidrati</p>
										</div>
									)}
								</div>
							</>
						)}

						<Separator className="my-6" />

						{/* Ingredients with image on the right */}
						<h3
							id="sestavine"
							className="mb-4 scroll-mt-24 font-serif text-xl font-semibold"
						>
							Sestavine
						</h3>
						<div className="flex flex-col gap-6 md:flex-row">
							<div className="min-w-0 flex-1">
								{recipe.ingredientGroups?.length > 0 && (
									<IngredientChecklist groups={recipe.ingredientGroups} />
								)}
							</div>

							{recipe.coverImage && (
								<div className="shrink-0 md:w-56 lg:w-64">
									<OptimizedImage
										image={recipe.coverImage}
										alt={recipe.title}
										width={300}
										height={450}
										className="w-full rounded-lg object-cover"
										priority
									/>
								</div>
							)}
						</div>

						<Separator className="my-6" />

						{/* Steps */}
						<h3
							id="navodila"
							className="mb-4 scroll-mt-24 font-serif text-xl font-semibold"
						>
							Navodila
						</h3>
						{recipe.stepGroups?.length > 0 && <StepChecklist groups={recipe.stepGroups} />}
					</div>

					{/* Related recipes */}
					{recipe.relatedRecipes && recipe.relatedRecipes.length > 0 && (
						<section className="mt-12">
							<h2
								id="podobni-recepti"
								className="mb-6 scroll-mt-24 font-serif text-2xl font-bold"
							>
								Podobni recepti
							</h2>
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{recipe.relatedRecipes.map((related) => (
									<RecipeCard key={related._id} recipe={related} />
								))}
							</div>
						</section>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
					<TableOfContents headings={allHeadings} />
					<ProfileSidebar />
				</div>
			</div>
		</div>
	);
}
