import { Clock, ChefHat } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import { RECIPE_CATEGORY_LABELS, RECIPE_DIFFICULTY_LABELS } from "@/lib/constants";
import type { RecipeListing } from "@/types/recipe";

interface RecipeCardProps {
	recipe: RecipeListing;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
	const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

	return (
		<a href={`/recipes/${recipe.slug}`}>
			<Card className="group overflow-hidden transition-shadow hover:shadow-lg">
				{recipe.coverImage && (
					<div className="aspect-[4/3] overflow-hidden">
						<OptimizedImage
							image={recipe.coverImage}
							alt={recipe.title}
							width={600}
							height={450}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}
				<CardContent className="p-4">
					<div className="mb-2 flex flex-wrap gap-1.5">
						{recipe.category && (
							<Badge variant="secondary" className="text-xs">
								{RECIPE_CATEGORY_LABELS[recipe.category] ?? recipe.category}
							</Badge>
						)}
						{recipe.difficulty && (
							<Badge variant="outline" className="text-xs">
								{RECIPE_DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
							</Badge>
						)}
					</div>
					<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
						{recipe.title}
					</h3>
					<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
						{totalTime > 0 && (
							<span className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								{formatDuration(totalTime)}
							</span>
						)}
						{recipe.cuisine && (
							<span className="flex items-center gap-1">
								<ChefHat className="h-3.5 w-3.5" />
								{recipe.cuisine}
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</a>
	);
}
