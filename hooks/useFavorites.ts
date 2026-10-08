import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/react";
import type { RecipeListing } from "@/types/recipe";

export interface Favorite {
	contentId: string;
	contentType: string;
	recipe?: RecipeListing;
	/** Ids of every language version of the recipe. */
	recipeIds?: string[];
}

interface UseFavoritesReturn {
	favorites: Favorite[];
	loading: boolean;
	error: string | null;
	toggle: (contentId: string, contentType: string) => Promise<void>;
	isFavorited: (contentId: string) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
	const { t, locale } = useI18n();
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFavorites = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/favorites?locale=${locale}`);
			if (res.status === 401) {
				setFavorites([]);
				return;
			}
			if (!res.ok) throw new Error(t("common.errors.favoritesLoad"));
			const data = (await res.json()) as Favorite[];
			setFavorites(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : t("common.errors.favoritesLoad"));
		} finally {
			setLoading(false);
		}
	}, [locale, t]);

	useEffect(() => {
		fetchFavorites();
	}, [fetchFavorites]);

	const toggle = useCallback(
		async (contentId: string, contentType: string) => {
			try {
				const res = await fetch("/api/favorites/toggle", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ contentId, contentType }),
				});
				if (!res.ok) throw new Error(t("common.errors.favoritesUpdate"));
				const data = await res.json();

				if (data.favorited) {
					setFavorites((prev) => [...prev, { contentId, contentType }]);
				} else {
					setFavorites((prev) => prev.filter((f) => f.contentId !== contentId));
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : t("common.errors.favoritesUpdate"));
			}
		},
		[t],
	);

	const isFavorited = useCallback(
		(contentId: string) => {
			return favorites.some((f) => f.contentId === contentId);
		},
		[favorites],
	);

	return { favorites, loading, error, toggle, isFavorited };
}
