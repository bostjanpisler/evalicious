import { MapPin } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/react";
import type { TravelEntry } from "@/types/sanity";

interface TravelCardProps {
	entry: TravelEntry;
}

export function TravelCard({ entry }: TravelCardProps) {
	const { l } = useI18n();
	const locationLabel = [entry.location, entry.country].filter(Boolean).join(", ");

	return (
		<a href={l(`/travel/${entry.slug}`)} className="block h-full">
			<Card className="group h-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
				{entry.coverImage && (
					<div className="aspect-[16/9] overflow-hidden">
						<OptimizedImage
							image={entry.coverImage}
							alt={entry.title}
							width={600}
							height={338}
							className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
						<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{entry.description}</p>
					)}
				</CardContent>
			</Card>
		</a>
	);
}
