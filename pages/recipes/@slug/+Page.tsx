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
import type { Data } from "./+data";

export default function RecipePage() {
	const recipe = useData<Data>();
	const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
	const headings = recipe.content ? extractHeadings(recipe.content) : [];

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[{ label: "Recipes", href: "/recipes" }, { label: recipe.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Main content */}
				<div className="lg:col-span-2">
					{recipe.coverImage && (
						<OptimizedImage
							image={recipe.coverImage}
							alt={recipe.title}
							width={900}
							height={600}
							className="w-full rounded-xl object-cover"
							priority
						/>
					)}

					<div className="mt-6">
						<div className="flex flex-wrap items-start gap-2">
							{recipe.category && (
								<Badge variant="secondary" className="capitalize">
									{recipe.category}
								</Badge>
							)}
							{recipe.difficulty && (
								<Badge variant="outline" className="capitalize">
									{recipe.difficulty}
								</Badge>
							)}
							{recipe.tags?.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>

						<h1 className="mt-4 font-serif text-4xl font-bold">{recipe.title}</h1>
						{recipe.description && (
							<p className="mt-3 text-lg text-muted-foreground">{recipe.description}</p>
						)}

						<div className="mt-4 flex items-center gap-2">
							<SaveRecipeButton recipeId={recipe._id} />
							<AddToListDialog contentType="recipe" contentId={recipe._id} />
						</div>

						{/* Meta info */}
						<div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
							{recipe.prepTime != null && recipe.prepTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Clock className="h-4 w-4" />
									Prep: {formatDuration(recipe.prepTime)}
								</span>
							)}
							{recipe.cookTime != null && recipe.cookTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Flame className="h-4 w-4" />
									Cook: {formatDuration(recipe.cookTime)}
								</span>
							)}
							{totalTime > 0 && (
								<span className="flex items-center gap-1.5">
									<Clock className="h-4 w-4" />
									Total: {formatDuration(totalTime)}
								</span>
							)}
							{recipe.servings != null && (
								<span className="flex items-center gap-1.5">
									<Users className="h-4 w-4" />
									{recipe.servings} servings
								</span>
							)}
							{recipe.cuisine && (
								<span className="flex items-center gap-1.5">
									<ChefHat className="h-4 w-4" />
									{recipe.cuisine}
								</span>
							)}
						</div>
					</div>

					{/* Nutrition */}
					{recipe.nutritionInfo && (
						<>
							<Separator className="my-8" />
							<div className="grid grid-cols-4 gap-4 rounded-lg bg-muted p-4 text-center">
								{recipe.nutritionInfo.calories != null && (
									<div>
										<p className="text-2xl font-bold">{recipe.nutritionInfo.calories}</p>
										<p className="text-xs text-muted-foreground">Calories</p>
									</div>
								)}
								{recipe.nutritionInfo.protein != null && (
									<div>
										<p className="text-2xl font-bold">{recipe.nutritionInfo.protein}g</p>
										<p className="text-xs text-muted-foreground">Protein</p>
									</div>
								)}
								{recipe.nutritionInfo.fat != null && (
									<div>
										<p className="text-2xl font-bold">{recipe.nutritionInfo.fat}g</p>
										<p className="text-xs text-muted-foreground">Fat</p>
									</div>
								)}
								{recipe.nutritionInfo.carbs != null && (
									<div>
										<p className="text-2xl font-bold">{recipe.nutritionInfo.carbs}g</p>
										<p className="text-xs text-muted-foreground">Carbs</p>
									</div>
								)}
							</div>
						</>
					)}

					<Separator className="my-8" />

					{/* Ingredients */}
					{recipe.ingredientGroups?.length > 0 && (
						<IngredientChecklist groups={recipe.ingredientGroups} />
					)}

					<Separator className="my-8" />

					{/* Steps */}
					{recipe.stepGroups?.length > 0 && <StepChecklist groups={recipe.stepGroups} />}

					{/* Additional content */}
					{recipe.content && (
						<>
							<Separator className="my-8" />
							<PortableTextRenderer value={recipe.content} />
						</>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
					{headings.length > 0 && <TableOfContents headings={headings} />}
				</div>
			</div>
		</div>
	);
}
