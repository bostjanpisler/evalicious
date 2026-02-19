import { useData } from "vike-react/useData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { BookOpen, Download, Play, ShoppingBag } from "lucide-react";
import type { Data } from "./+data.server";

const typeLabels: Record<string, string> = {
	ebook: "E-knjiga",
	ecourse: "E-tečaj",
	offline_course: "Tečaj v živo",
};

const statusLabels: Record<string, string> = {
	completed: "Zaključeno",
	pending: "V obdelavi",
	failed: "Neuspešno",
};

export default function MyOrdersPage() {
	const { orders } = useData<Data>();

	if (orders.length === 0) {
		return (
			<div>
				<h2 className="font-serif text-2xl font-bold mb-6">Moja naročila</h2>
				<div className="text-center py-16">
					<ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
					<h3 className="mt-4 font-serif text-lg font-semibold text-muted-foreground">
						Še nimaš naročil
					</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Ko kupiš izdelek, se bo tukaj prikazal.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">Moja naročila</h2>

			<div className="space-y-4">
				{orders.map((order) => (
					<div
						key={order.id}
						className="rounded-lg border bg-card p-5"
					>
						<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
							<div className="flex items-center gap-3">
								<span className="text-sm text-muted-foreground">
									{formatDate(order.createdAt)}
								</span>
								<Badge
									variant={order.status === "completed" ? "default" : "secondary"}
									className="text-xs"
								>
									{statusLabels[order.status] ?? order.status}
								</Badge>
							</div>
							<span className="text-sm font-semibold">
								{formatPrice(order.totalInCents, order.currency)}
							</span>
						</div>

						{order.items.map((item) => (
							<div
								key={item.id}
								className="flex flex-wrap items-center justify-between gap-3"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
										{item.productType === "ebook" ? (
											<BookOpen className="h-4 w-4 text-muted-foreground" />
										) : (
											<Play className="h-4 w-4 text-muted-foreground" />
										)}
									</div>
									<div>
										<a
											href={`/shop/${item.productSlug}`}
											className="text-sm font-medium hover:text-primary"
										>
											{item.productName}
										</a>
										<p className="text-xs text-muted-foreground">
											{typeLabels[item.productType] ?? item.productType}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									{item.productType === "ebook" && order.status === "completed" && (
										<a href={`/api/download/${order.id}`}>
											<Button variant="outline" size="sm" className="gap-1.5">
												<Download className="h-3.5 w-3.5" />
												Prenesi
											</Button>
										</a>
									)}
									{item.productType === "ecourse" &&
										order.status === "completed" &&
										item.courseSlug && (
											<a href={`/dashboard/my-courses/${item.courseSlug}`}>
												<Button variant="outline" size="sm" className="gap-1.5">
													<Play className="h-3.5 w-3.5" />
													Pojdi na tečaj
												</Button>
											</a>
										)}
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
