import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TravelCard } from "@/components/travel/TravelCard";
import type { Data } from "./+data";

export default function TravelPage() {
	const { entries } = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Potovanja" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Potovanja</h1>
			<p className="mt-2 text-muted-foreground">
				Pustolovščine in odkritja z vsega sveta.
			</p>

			<div className="mt-8">
				{entries.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Še ni potovalnih zapisov. Preveri kmalu!
					</p>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{entries.map((entry) => (
							<TravelCard key={entry._id} entry={entry} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
