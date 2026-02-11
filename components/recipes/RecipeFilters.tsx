"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTIES, RECIPE_CATEGORY_LABELS, RECIPE_DIFFICULTY_LABELS } from "@/lib/constants";
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
	const hasFilters = search || category || difficulty;

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Išči recepte..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">Kategorija:</span>
				{RECIPE_CATEGORIES.map((cat) => (
					<Badge
						key={cat}
						variant={category === cat ? "default" : "outline"}
						className={cn("cursor-pointer", category === cat && "bg-primary")}
						onClick={() => onCategoryChange(category === cat ? "" : cat)}
					>
						{RECIPE_CATEGORY_LABELS[cat] ?? cat}
					</Badge>
				))}
			</div>

			<div className="flex items-center gap-3">
				<Select value={difficulty} onValueChange={onDifficultyChange}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Težavnost" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Vse ravni</SelectItem>
						{RECIPE_DIFFICULTIES.map((d) => (
							<SelectItem key={d} value={d}>
								{RECIPE_DIFFICULTY_LABELS[d] ?? d}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasFilters && (
					<Button variant="ghost" size="sm" onClick={onClear}>
						<X className="mr-1 h-3 w-3" />
						Počisti filtre
					</Button>
				)}
			</div>
		</div>
	);
}
