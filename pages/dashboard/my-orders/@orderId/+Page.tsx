import { ArrowLeft, BookOpen, Download, Play, ReceiptText } from "lucide-react";
import { useData } from "vike-react/useData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
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

export default function OrderDetailPage() {
	const { order } = useData<Data>();

	return (
		<div className="max-w-3xl">
			<a
				href="/dashboard/my-orders"
				className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				Nazaj na naročila
			</a>

			<div className="rounded-xl border bg-card">
				<div className="flex flex-wrap items-start justify-between gap-4 border-b p-6">
					<div>
						<div className="mb-2 flex items-center gap-2">
							<ReceiptText className="h-5 w-5 text-amber-600" />
							<h2 className="font-serif text-2xl font-bold">Podrobnosti naročila</h2>
						</div>
						<p className="text-sm text-muted-foreground">Oddano {formatDate(order.createdAt)}</p>
					</div>
					<Badge variant={order.status === "completed" ? "default" : "secondary"}>
						{statusLabels[order.status] ?? order.status}
					</Badge>
				</div>

				<div className="space-y-5 p-6">
					{order.items.map((item) => (
						<div key={item.id} className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									{item.productType === "ebook" ? (
										<BookOpen className="h-5 w-5 text-muted-foreground" />
									) : (
										<Play className="h-5 w-5 text-muted-foreground" />
									)}
								</div>
								<div>
									<a href={`/shop/${item.productSlug}`} className="font-medium hover:text-primary">
										{item.productName}
									</a>
									<p className="text-xs text-muted-foreground">
										{typeLabels[item.productType] ?? item.productType}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<span className="text-sm font-medium">
									{formatPrice(item.priceInCents, order.currency)}
								</span>
								{item.productType === "ebook" && order.status === "completed" && (
									<Button asChild variant="outline" size="sm" className="gap-1.5">
										<a href={`/api/download/${order.id}`}>
											<Download className="h-3.5 w-3.5" />
											Prenesi
										</a>
									</Button>
								)}
								{item.productType === "ecourse" &&
									order.status === "completed" &&
									item.courseSlug && (
										<Button asChild variant="outline" size="sm" className="gap-1.5">
											<a href={`/dashboard/my-courses/${item.courseSlug}`}>
												<Play className="h-3.5 w-3.5" />
												Odpri tečaj
											</a>
										</Button>
									)}
							</div>
						</div>
					))}

					<div className="border-t pt-5 text-sm">
						<div className="flex justify-between gap-4 font-semibold">
							<span>Skupaj</span>
							<span>{formatPrice(order.totalInCents, order.currency)}</span>
						</div>
						<div className="mt-4 space-y-1 text-muted-foreground">
							<p>E-pošta za dostavo: {order.email}</p>
							{order.invoiceNumber && <p>Številka računa: {order.invoiceNumber}</p>}
							<p className="break-all">ID naročila: {order.id}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
