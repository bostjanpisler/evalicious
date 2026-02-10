import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("space-y-3", className)}>
			<Skeleton className="aspect-[4/3] w-full rounded-lg" />
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-3 w-1/2" />
		</div>
	);
}

export function PageSkeleton() {
	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
			<Skeleton className="h-8 w-48" />
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no stable key
					<CardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
