import { MapPin } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Card, CardContent } from "@/components/ui/card";
import type { TravelEntry } from "@/types/sanity";

interface TravelCardProps {
	entry: TravelEntry;
}

export function TravelCard({ entry }: TravelCardProps) {
	const locationLabel = [entry.location, entry.country].filter(Boolean).join(", ");

	return (
		<a href={`/travel/${entry.slug}`}>
			<Card className="group overflow-hidden transition-shadow hover:shadow-lg">
				{entry.coverImage && (
					<div className="aspect-[16/9] overflow-hidden">
						<OptimizedImage
							image={entry.coverImage}
							alt={entry.title}
							width={600}
							height={338}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}
				<CardContent className="p-4">
					{locationLabel && (
						<div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
							<MapPin className="h-3.5 w-3.5" />
							{locationLabel}
						</div>
					)}
					<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
						{entry.title}
					</h3>
					{entry.description && (
						<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
							{entry.description}
						</p>
					)}
				</CardContent>
			</Card>
		</a>
	);
}
