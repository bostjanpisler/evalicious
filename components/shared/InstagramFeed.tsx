"use client";

import { useState } from "react";

const RECENT_POSTS = [
	"DUik_7iCBn8",
	"DUgXFBhCORM",
	"DUaWc49iF2h",
	"DUXvQ4wCGe0",
	"DUNWlvnCPsL",
	"DS650guEy5x",
	"DSt-wPeAXRF",
	"DSfocmpAWPY",
	"DScjJwfgRXa",
];

interface InstagramFeedProps {
	variant?: "default" | "wide";
}

export function InstagramFeed({ variant = "default" }: InstagramFeedProps) {
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

	const handleError = (shortcode: string) => {
		setFailedImages((prev) => new Set(prev).add(shortcode));
	};

	const visiblePosts = RECENT_POSTS.filter((sc) => !failedImages.has(sc));
	const gridClass =
		variant === "wide"
			? "grid grid-cols-3 gap-1.5 overflow-hidden rounded-md sm:grid-cols-4 lg:grid-cols-5"
			: "grid grid-cols-3 gap-1 overflow-hidden rounded-md";
	const postCount = variant === "wide" ? visiblePosts.length : 9;

	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<a
				href="https://www.instagram.com/susiiiiin/"
				target="_blank"
				rel="noopener noreferrer"
				className="mb-3 flex items-center gap-2.5"
			>
				<img
					src="/images/eva-profile.svg"
					alt="@susiiiiin"
					width={36}
					height={36}
					className="rounded-full object-cover"
					loading="lazy"
				/>
				<div className="min-w-0">
					<p className="text-sm font-semibold leading-tight">susiiiiin</p>
					<p className="truncate text-xs text-muted-foreground">
						Sledi mi na instagramu za še več receptov 🌱, potovanj ✈️ in vpogled v moje življenje✨
					</p>
				</div>
			</a>

			<div className={gridClass}>
				{visiblePosts.slice(0, postCount).map((shortcode) => (
					<a
						key={shortcode}
						href={`https://www.instagram.com/reel/${shortcode}/`}
						target="_blank"
						rel="noopener noreferrer"
						className="relative block aspect-square overflow-hidden bg-muted transition-opacity hover:opacity-80"
					>
						<img
							src={`/api/ig/${shortcode}`}
							alt="Instagram post"
							className="h-full w-full object-cover"
							loading="lazy"
							onError={() => handleError(shortcode)}
						/>
					</a>
				))}
			</div>

			{/* Follow link */}
			<a
				href="https://www.instagram.com/susiiiiin/"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-3 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					className="h-4 w-4"
					aria-hidden="true"
				>
					<rect x={2} y={2} width={20} height={20} rx={5} />
					<circle cx={12} cy={12} r={5} />
					<circle cx={17.5} cy={6.5} r={1.5} fill="currentColor" stroke="none" />
				</svg>
				Sledi @susiiiiin
			</a>
		</div>
	);
}
