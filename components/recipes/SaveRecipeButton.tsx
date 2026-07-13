"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics-client";
import { cn } from "@/lib/utils";

interface SaveRecipeButtonProps {
	recipeId: string;
	initialFavorited?: boolean;
}

export function SaveRecipeButton({ recipeId, initialFavorited = false }: SaveRecipeButtonProps) {
	const [favorited, setFavorited] = useState(initialFavorited);
	const [loading, setLoading] = useState(false);

	async function toggle() {
		setLoading(true);
		try {
			const res = await fetch("/api/favorites/toggle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contentType: "recipe", contentId: recipeId }),
			});
			if (res.ok) {
				const data = await res.json();
				setFavorited(data.favorited);
				capture(data.favorited ? "recipe_favorited" : "recipe_unfavorited", {
					recipe_id: recipeId,
				});
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggle}
			disabled={loading}
			aria-label={favorited ? "Odstrani iz priljubljenih" : "Shrani med priljubljene"}
		>
			<Heart className={cn("mr-1.5 h-4 w-4", favorited && "fill-primary text-primary")} />
			{favorited ? "Shranjeno" : "Shrani"}
		</Button>
	);
}
