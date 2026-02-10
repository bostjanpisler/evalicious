"use client";

import { useEffect, useState } from "react";

export function useIntersectionObserver(ids: string[]): string | null {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (ids.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-80px 0px -80% 0px",
				threshold: 0,
			},
		);

		for (const id of ids) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [ids]);

	return activeId;
}
