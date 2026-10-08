"use client";

import { Search, X } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	RECIPE_CATEGORIES,
	RECIPE_DIFFICULTIES,
	recipeCategoryLabel,
	recipeDifficultyLabel,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

interface RecipeFiltersProps {
	search: string;
	category: string;
	difficulty: string;
	onSearchChange: (value: string) => void;
	onCategoryChange: (value: string) => void;
	onDifficultyChange: (value: string) => void;
	onClear: () => void;
}

export function RecipeFilters({
	search,
	category,
	difficulty,
	onSearchChange,
	onCategoryChange,
	onDifficultyChange,
	onClear,
}: RecipeFiltersProps) {
	const { t } = useI18n();
	const hasFilters = search || category || difficulty;

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search
					className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					aria-label={t("recipes.filters.searchLabel")}
					placeholder={t("recipes.filters.searchPlaceholder")}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">
					{t("recipes.filters.category")}
				</span>
				{RECIPE_CATEGORIES.map((cat) => (
					<button
						type="button"
						key={cat}
						aria-pressed={category === cat}
						className={cn(
							badgeVariants({ variant: category === cat ? "default" : "outline" }),
							category === cat && "bg-primary",
						)}
						onClick={() => onCategoryChange(category === cat ? "" : cat)}
					>
						{recipeCategoryLabel(t, cat)}
					</button>
				))}
			</div>

			<div className="flex items-center gap-3">
				<Select value={difficulty} onValueChange={onDifficultyChange}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder={t("recipes.filters.difficulty")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("recipes.filters.allLevels")}</SelectItem>
						{RECIPE_DIFFICULTIES.map((d) => (
							<SelectItem key={d} value={d}>
								{recipeDifficultyLabel(t, d)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasFilters && (
					<Button variant="ghost" size="sm" onClick={onClear}>
						<X className="mr-1 h-3 w-3" />
						{t("recipes.filters.clear")}
					</Button>
				)}
			</div>
		</div>
	);
}
