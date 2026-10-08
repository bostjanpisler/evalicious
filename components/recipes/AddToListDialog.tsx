"use client";

import { ListPlus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/react";

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
	const { t, l } = useI18n();
	const pageContext = usePageContext();
	const user = pageContext.user;
	const [lists, setLists] = useState<UserList[]>([]);
	const [newListName, setNewListName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;
		fetch("/api/lists")
			.then((r) => (r.ok ? r.json() : []))
			.then(setLists)
			.catch(() => setError(t("recipes.addToList.loadError")));
	}, [user, t]);

	async function createList() {
		if (!user) {
			window.location.href = l(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
			return;
		}
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
			} else setError(t("recipes.addToList.createError"));
		} catch {
			setError(t("recipes.addToList.createError"));
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
				prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, { contentId }] } : l)),
			);
		} else setError(t("recipes.addToList.addError"));
	}

	async function removeFromList(listId: string) {
		const res = await fetch(`/api/lists/${listId}/items/${contentId}`, {
			method: "DELETE",
		});
		if (res.ok) {
			setLists((prev) =>
				prev.map((l) =>
					l.id === listId ? { ...l, items: l.items.filter((i) => i.contentId !== contentId) } : l,
				),
			);
		} else setError(t("recipes.addToList.removeError"));
	}

	if (!user) {
		return (
			<Button asChild variant="outline" size="sm">
				<a
					href={l(`/login?redirect=${encodeURIComponent(l(pageContext.urlPathname))}`)}
					aria-label={t("recipes.addToList.loginAria")}
				>
					<ListPlus className="mr-1.5 h-4 w-4" />
					{t("recipes.addToList.button")}
				</a>
			</Button>
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<ListPlus className="mr-1.5 h-4 w-4" />
					{t("recipes.addToList.button")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("recipes.addToList.button")}</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{error && <p className="text-sm text-destructive">{error}</p>}
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
									<span className="text-xs text-primary">{t("recipes.addToList.added")}</span>
								)}
							</button>
						);
					})}
					<div className="flex gap-2">
						<Input
							placeholder={t("recipes.addToList.newListPlaceholder")}
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
