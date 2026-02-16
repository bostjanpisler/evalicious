"use client";

import { useMemo, useState } from "react";
import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TravelCard } from "@/components/travel/TravelCard";
import { TravelFilters } from "@/components/travel/TravelFilters";
import type { Data } from "./+data";

export default function TravelPage() {
	const { entries } = useData<Data>();
	const [search, setSearch] = useState("");
	const [selectedCountry, setSelectedCountry] = useState("");
	const [selectedTag, setSelectedTag] = useState("");

	const countries = useMemo(() => {
		const set = new Set<string>();
		for (const entry of entries) {
			if (entry.country) set.add(entry.country);
		}
		return [...set].sort();
	}, [entries]);

	const tags = useMemo(() => {
		const set = new Set<string>();
		for (const entry of entries) {
			if (entry.tags) {
				for (const tag of entry.tags) set.add(tag);
			}
		}
		return [...set].sort();
	}, [entries]);

	const filtered = useMemo(() => {
		return entries.filter((entry) => {
			if (search) {
				const q = search.toLowerCase();
				const matchesTitle = entry.title.toLowerCase().includes(q);
				const matchesDesc = entry.description?.toLowerCase().includes(q);
				const matchesLocation = entry.location?.toLowerCase().includes(q);
				const matchesCountry = entry.country?.toLowerCase().includes(q);
				const matchesTags = entry.tags?.some((t) =>
					t.toLowerCase().includes(q),
				);
				if (
					!matchesTitle &&
					!matchesDesc &&
					!matchesLocation &&
					!matchesCountry &&
					!matchesTags
				)
					return false;
			}
			if (selectedCountry && entry.country !== selectedCountry) return false;
			if (selectedTag && !entry.tags?.includes(selectedTag)) return false;
			return true;
		});
	}, [entries, search, selectedCountry, selectedTag]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Potovanja" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Potovanja</h1>
			<p className="mt-2 text-muted-foreground">
				Pustolovščine in odkritja z vsega sveta.
			</p>

			<div className="mt-8">
				<TravelFilters
					search={search}
					selectedCountry={selectedCountry}
					selectedTag={selectedTag}
					countries={countries}
					tags={tags}
					onSearchChange={setSearch}
					onCountryChange={setSelectedCountry}
					onTagChange={setSelectedTag}
					onClear={() => {
						setSearch("");
						setSelectedCountry("");
						setSelectedTag("");
					}}
				/>
			</div>

			<div className="mt-8">
				{filtered.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Ni potovalnih zapisov, ki ustrezajo tvojim filtrom.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filtered.map((entry) => (
							<TravelCard key={entry._id} entry={entry} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
