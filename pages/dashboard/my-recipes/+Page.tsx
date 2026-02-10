"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/hooks/useFavorites";

interface List {
	id: string;
	name: string;
	itemCount: number;
}

export default function MyRecipesPage() {
	const { favorites, loading: favoritesLoading } = useFavorites();
	const [lists, setLists] = useState<List[]>([]);
	const [listsLoading, setListsLoading] = useState(false);
	const [newListName, setNewListName] = useState("");
	const [listsError, setListsError] = useState<string | null>(null);

	const fetchLists = async () => {
		setListsLoading(true);
		setListsError(null);
		try {
			const res = await fetch("/api/lists");
			if (!res.ok) throw new Error("Failed to fetch lists");
			const data = await res.json();
			setLists(data.lists ?? []);
		} catch (err) {
			setListsError(
				err instanceof Error ? err.message : "Failed to load lists"
			);
		} finally {
			setListsLoading(false);
		}
	};

	const createList = async () => {
		if (!newListName.trim()) return;
		try {
			const res = await fetch("/api/lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newListName.trim() }),
			});
			if (!res.ok) throw new Error("Failed to create list");
			setNewListName("");
			await fetchLists();
		} catch (err) {
			setListsError(
				err instanceof Error ? err.message : "Failed to create list"
			);
		}
	};

	const deleteList = async (listId: string) => {
		try {
			const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete list");
			await fetchLists();
		} catch (err) {
			setListsError(
				err instanceof Error ? err.message : "Failed to delete list"
			);
		}
	};

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">My Recipes</h2>

			<Tabs defaultValue="favorites" className="w-full">
				<TabsList>
					<TabsTrigger value="favorites">Favorites</TabsTrigger>
					<TabsTrigger value="lists" onClick={() => fetchLists()}>
						Lists
					</TabsTrigger>
				</TabsList>

				<TabsContent value="favorites" className="mt-6">
					{favoritesLoading ? (
						<p className="text-gray-500">Loading favorites...</p>
					) : favorites.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 mb-2">
								No favorites yet.
							</p>
							<p className="text-sm text-gray-400">
								Browse recipes and tap the heart icon to save
								your favorites.
							</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{favorites.map((fav) => (
								<div
									key={fav.contentId}
									className="rounded-lg border border-gray-200 p-4 hover:border-amber-300 transition-colors"
								>
									<p className="text-sm text-gray-600">
										Content ID:{" "}
										<span className="font-mono text-xs">
											{fav.contentId}
										</span>
									</p>
									<p className="text-xs text-gray-400 mt-1">
										Type: {fav.contentType}
									</p>
								</div>
							))}
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
							placeholder="New list name..."
							className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
						/>
						<button
							onClick={createList}
							disabled={!newListName.trim()}
							className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Create
						</button>
					</div>

					{listsError && (
						<p className="text-red-600 text-sm mb-4">
							{listsError}
						</p>
					)}

					{listsLoading ? (
						<p className="text-gray-500">Loading lists...</p>
					) : lists.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 mb-2">
								No lists yet.
							</p>
							<p className="text-sm text-gray-400">
								Create a list to organize your favorite recipes.
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
										<p className="font-medium">
											{list.name}
										</p>
										<p className="text-sm text-gray-500">
											{list.itemCount}{" "}
											{list.itemCount === 1
												? "item"
												: "items"}
										</p>
									</div>
									<button
										onClick={() => deleteList(list.id)}
										className="text-sm text-red-500 hover:text-red-700 transition-colors"
									>
										Delete
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
