"use client";

import { useMemo, useState } from "react";
import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { ProfileSidebar } from "@/components/shared/ProfileSidebar";
import type { Data } from "./+data";

export default function RecipesPage() {
	const { recipes } = useData<Data>();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [difficulty, setDifficulty] = useState("");

	const filtered = useMemo(() => {
		return recipes.filter((recipe) => {
			if (search) {
				const q = search.toLowerCase();
				const matchesTitle = recipe.title.toLowerCase().includes(q);
				const matchesTags = recipe.tags?.some((t) => t.toLowerCase().includes(q));
				const matchesCuisine = recipe.cuisine?.toLowerCase().includes(q);
				if (!matchesTitle && !matchesTags && !matchesCuisine) return false;
			}
			if (category && recipe.category !== category) return false;
			if (difficulty && difficulty !== "all" && recipe.difficulty !== difficulty) return false;
			return true;
		});
	}, [recipes, search, category, difficulty]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Recepti" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Recepti</h1>
			<p className="mt-2 text-muted-foreground">
				Razišči vse recepte. Uporabi filtre, da najdeš točno to, kar iščeš.
			</p>

			<div className="mt-8">
				<RecipeFilters
					search={search}
					category={category}
					difficulty={difficulty}
					onSearchChange={setSearch}
					onCategoryChange={setCategory}
					onDifficultyChange={setDifficulty}
					onClear={() => {
						setSearch("");
						setCategory("");
						setDifficulty("");
					}}
				/>
			</div>

			<div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr,280px]">
				{/* Recipe grid */}
				<div>
					{filtered.length === 0 ? (
						<p className="py-12 text-center text-muted-foreground">
							Ni receptov, ki ustrezajo tvojim filtrom.
						</p>
					) : (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{filtered.map((recipe) => (
								<RecipeCard key={recipe._id} recipe={recipe} />
							))}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<aside className="hidden lg:block">
					<div className="sticky top-24">
						<ProfileSidebar />
					</div>
				</aside>
			</div>
		</div>
	);
}
