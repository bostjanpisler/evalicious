import { useState, useEffect, useCallback } from "react";

interface Favorite {
	contentId: string;
	contentType: string;
}

interface UseFavoritesReturn {
	favorites: Favorite[];
	loading: boolean;
	error: string | null;
	toggle: (contentId: string, contentType: string) => Promise<void>;
	isFavorited: (contentId: string) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFavorites = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/favorites");
			if (!res.ok) throw new Error("Failed to fetch favorites");
			const data = await res.json();
			setFavorites(data.favorites ?? []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load favorites"
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFavorites();
	}, [fetchFavorites]);

	const toggle = useCallback(
		async (contentId: string, contentType: string) => {
			try {
				const res = await fetch("/api/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ contentId, contentType }),
				});
				if (!res.ok) throw new Error("Failed to toggle favorite");
				const data = await res.json();

				if (data.action === "added") {
					setFavorites((prev) => [
						...prev,
						{ contentId, contentType },
					]);
				} else {
					setFavorites((prev) =>
						prev.filter((f) => f.contentId !== contentId)
					);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to toggle favorite"
				);
			}
		},
		[]
	);

	const isFavorited = useCallback(
		(contentId: string) => {
			return favorites.some((f) => f.contentId === contentId);
		},
		[favorites]
	);

	return { favorites, loading, error, toggle, isFavorited };
}
