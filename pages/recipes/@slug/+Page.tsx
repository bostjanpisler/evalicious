import { useData } from "vike-react/useData";
import { Clock, Users, ChefHat, Flame } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { IngredientChecklist } from "@/components/recipes/IngredientChecklist";
import { StepChecklist } from "@/components/recipes/StepChecklist";
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
import { RECIPE_CATEGORY_LABELS, RECIPE_DIFFICULTY_LABELS } from "@/lib/constants";
import type { Data } from "./+data";

export default function RecipePage() {
	const recipe = useData<Data>();
	const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
	const headings = recipe.content ? extractHeadings(recipe.content) : [];

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
					{recipe.content && (
						<>
							<Separator className="my-8" />
							<PortableTextRenderer value={recipe.content} />
						</>
					)}

					{/* Recipe card */}
					<div className="my-8 rounded-xl border border-border bg-card p-6">
						<h2 className="font-serif text-2xl font-bold">{recipe.title}</h2>

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
								<div className="grid grid-cols-4 gap-4 rounded-lg bg-muted p-4 text-center">
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
						{recipe.stepGroups?.length > 0 && <StepChecklist groups={recipe.stepGroups} />}
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
					{headings.length > 0 && <TableOfContents headings={headings} />}
				</div>
			</div>
		</div>
	);
}
