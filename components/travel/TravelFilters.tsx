"use client";

import { Search, X } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TravelFiltersProps {
	search: string;
	selectedCountry: string;
	selectedTag: string;
	countries: string[];
	tags: string[];
	onSearchChange: (value: string) => void;
	onCountryChange: (value: string) => void;
	onTagChange: (value: string) => void;
	onClear: () => void;
}

export function TravelFilters({
	search,
	selectedCountry,
	selectedTag,
	countries,
	tags,
	onSearchChange,
	onCountryChange,
	onTagChange,
	onClear,
}: TravelFiltersProps) {
	const hasFilters = search || selectedCountry || selectedTag;

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search
					className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					aria-label="Išči potovanja"
					placeholder="Išči potovanja..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9"
				/>
			</div>

			{countries.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground">Država:</span>
					{countries.map((country) => (
						<button
							type="button"
							key={country}
							aria-pressed={selectedCountry === country}
							className={cn(
								badgeVariants({
									variant: selectedCountry === country ? "default" : "outline",
								}),
								selectedCountry === country && "bg-primary",
							)}
							onClick={() => onCountryChange(selectedCountry === country ? "" : country)}
						>
							{country}
						</button>
					))}
				</div>
			)}

			{tags.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground">Oznake:</span>
					{tags.map((tag) => (
						<button
							type="button"
							key={tag}
							aria-pressed={selectedTag === tag}
							className={cn(
								badgeVariants({
									variant: selectedTag === tag ? "default" : "outline",
								}),
								selectedTag === tag && "bg-primary",
							)}
							onClick={() => onTagChange(selectedTag === tag ? "" : tag)}
						>
							{tag}
						</button>
					))}
				</div>
			)}

			{hasFilters && (
				<div>
					<Button variant="ghost" size="sm" onClick={onClear}>
						<X className="mr-1 h-3 w-3" />
						Počisti filtre
					</Button>
				</div>
			)}
		</div>
	);
}
