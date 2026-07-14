"use client";

import { useCallback, useEffect, useState } from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/hooks/useFavorites";

interface List {
	id: string;
	name: string;
	itemCount: number;
	items?: { contentId: string }[];
}

export default function MyRecipesPage() {
	const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites();
	const recipeFavorites = favorites.filter((favorite) => favorite.recipe);
	const [lists, setLists] = useState<List[]>([]);
	const [listsLoading, setListsLoading] = useState(false);
	const [newListName, setNewListName] = useState("");
	const [listsError, setListsError] = useState<string | null>(null);

	const fetchLists = useCallback(async () => {
		setListsLoading(true);
		setListsError(null);
		try {
			const res = await fetch("/api/lists");
			if (!res.ok) throw new Error("Napaka pri nalaganju seznamov");
			const data = (await res.json()) as List[];
			setLists(data.map((list) => ({ ...list, itemCount: list.items?.length ?? 0 })));
		} catch (err) {
			setListsError(err instanceof Error ? err.message : "Napaka pri nalaganju seznamov");
		} finally {
			setListsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchLists();
	}, [fetchLists]);

	const createList = async () => {
		if (!newListName.trim()) return;
		try {
			const res = await fetch("/api/lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newListName.trim() }),
			});
			if (!res.ok) throw new Error("Napaka pri ustvarjanju seznama");
			setNewListName("");
			await fetchLists();
		} catch (err) {
			setListsError(err instanceof Error ? err.message : "Napaka pri ustvarjanju seznama");
		}
	};

	const deleteList = async (listId: string) => {
		try {
			const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Napaka pri brisanju seznama");
			await fetchLists();
		} catch (err) {
			setListsError(err instanceof Error ? err.message : "Napaka pri brisanju seznama");
		}
	};

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">Moji recepti</h2>

			<Tabs defaultValue="favorites" className="w-full">
				<TabsList>
					<TabsTrigger value="favorites">Priljubljeni</TabsTrigger>
					<TabsTrigger value="lists">Seznami</TabsTrigger>
				</TabsList>

				<TabsContent value="favorites" className="mt-6">
					{favoritesLoading ? (
						<p className="text-gray-500">Nalagam priljubljene...</p>
					) : favoritesError ? (
						<p className="text-sm text-destructive">{favoritesError}</p>
					) : recipeFavorites.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 mb-2">Še nimaš priljubljenih receptov.</p>
							<p className="text-sm text-gray-400">
								Razišči recepte in tapni ikono srca, da si shranješ priljubljene.
							</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{recipeFavorites.map((fav) =>
								fav.recipe ? <RecipeCard key={fav.contentId} recipe={fav.recipe} /> : null,
							)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="lists" className="mt-6">
					{/* Create new list */}
					<div className="flex gap-2 mb-6">
						<input
							type="text"
							value={newListName}
							onChange={(e) => setNewListName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && createList()}
							placeholder="Ime novega seznama..."
							className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
						/>
						<button
							type="button"
							onClick={createList}
							disabled={!newListName.trim()}
							className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Ustvari
						</button>
					</div>

					{listsError && <p className="text-red-600 text-sm mb-4">{listsError}</p>}

					{listsLoading ? (
						<p className="text-gray-500">Nalagam sezname...</p>
					) : lists.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 mb-2">Še nimaš seznamov.</p>
							<p className="text-sm text-gray-400">
								Ustvari seznam za organizacijo priljubljenih receptov.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{lists.map((list) => (
								<div
									key={list.id}
									className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-amber-300 transition-colors"
								>
									<div>
										<p className="font-medium">{list.name}</p>
										<p className="text-sm text-gray-500">
											{list.itemCount} {list.itemCount === 1 ? "element" : "elementov"}
										</p>
									</div>
									<button
										type="button"
										onClick={() => deleteList(list.id)}
										className="text-sm text-red-500 hover:text-red-700 transition-colors"
									>
										Izbriši
									</button>
								</div>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
