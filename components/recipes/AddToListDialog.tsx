"use client";

import { ListPlus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface UserList {
	id: string;
	name: string;
	items: { contentId: string }[];
}

interface AddToListDialogProps {
	contentType: string;
	contentId: string;
}

export function AddToListDialog({ contentType, contentId }: AddToListDialogProps) {
	const [lists, setLists] = useState<UserList[]>([]);
	const [newListName, setNewListName] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetch("/api/lists")
			.then((r) => (r.ok ? r.json() : []))
			.then(setLists)
			.catch(() => {});
	}, []);

	async function createList() {
		if (!newListName.trim()) return;
		setLoading(true);
		try {
			const res = await fetch("/api/lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newListName }),
			});
			if (res.ok) {
				const list = await res.json();
				setLists((prev) => [...prev, { ...list, items: [] }]);
				setNewListName("");
			}
		} finally {
			setLoading(false);
		}
	}

	async function addToList(listId: string) {
		const res = await fetch(`/api/lists/${listId}/items`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ contentType, contentId }),
		});
		if (res.ok) {
			setLists((prev) =>
				prev.map((l) =>
					l.id === listId ? { ...l, items: [...l.items, { contentId }] } : l,
				),
			);
		}
	}

	async function removeFromList(listId: string) {
		const res = await fetch(`/api/lists/${listId}/items/${contentId}`, {
			method: "DELETE",
		});
		if (res.ok) {
			setLists((prev) =>
				prev.map((l) =>
					l.id === listId
						? { ...l, items: l.items.filter((i) => i.contentId !== contentId) }
						: l,
				),
			);
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<ListPlus className="mr-1.5 h-4 w-4" />
					Add to List
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add to List</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{lists.map((list) => {
						const isInList = list.items.some((i) => i.contentId === contentId);
						return (
							<button
								key={list.id}
								type="button"
								onClick={() => (isInList ? removeFromList(list.id) : addToList(list.id))}
								className="flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors hover:bg-accent"
							>
								<span className="text-sm font-medium">{list.name}</span>
								{isInList && (
									<span className="text-xs text-primary">Added</span>
								)}
							</button>
						);
					})}
					<div className="flex gap-2">
						<Input
							placeholder="New list name"
							value={newListName}
							onChange={(e) => setNewListName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && createList()}
						/>
						<Button size="sm" onClick={createList} disabled={loading}>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
