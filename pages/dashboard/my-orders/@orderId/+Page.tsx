import { ArrowLeft, BookOpen, Download, Play, ReceiptText } from "lucide-react";
import { useData } from "vike-react/useData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/react";
import { formatPrice } from "@/lib/utils";
import type { Data } from "./+data.server";

const typeKeys: Record<string, TranslationKey> = {
	ebook: "dashboard.orders.types.ebook",
	ecourse: "dashboard.orders.types.ecourse",
	offline_course: "dashboard.orders.types.offline_course",
};

const statusKeys: Record<string, TranslationKey> = {
	completed: "dashboard.orders.status.completed",
	pending: "dashboard.orders.status.pending",
	failed: "dashboard.orders.status.failed",
};

export default function OrderDetailPage() {
	const { order } = useData<Data>();
	const { t, l, formatDate } = useI18n();
	const label = (keys: Record<string, TranslationKey>, value: string) => {
		const key = keys[value];
		return key ? t(key) : value;
	};

	return (
		<div className="max-w-3xl">
			<a
				href={l("/dashboard/my-orders")}
				className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				{t("dashboard.orders.backToOrders")}
			</a>

			<div className="rounded-xl border bg-card">
				<div className="flex flex-wrap items-start justify-between gap-4 border-b p-6">
					<div>
						<div className="mb-2 flex items-center gap-2">
							<ReceiptText className="h-5 w-5 text-amber-600" />
							<h2 className="font-serif text-2xl font-bold">
								{t("dashboard.orders.detailsHeading")}
							</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							{t("dashboard.orders.placedOn", { date: formatDate(order.createdAt) })}
						</p>
					</div>
					<Badge variant={order.status === "completed" ? "default" : "secondary"}>
						{label(statusKeys, order.status)}
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
									<a
										href={l(`/shop/${item.productSlug}`)}
										className="font-medium hover:text-primary"
									>
										{item.productName}
									</a>
									<p className="text-xs text-muted-foreground">
										{label(typeKeys, item.productType)}
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
											{t("dashboard.orders.download")}
										</a>
									</Button>
								)}
								{item.productType === "ecourse" &&
									order.status === "completed" &&
									item.courseSlug && (
										<Button asChild variant="outline" size="sm" className="gap-1.5">
											<a href={l(`/dashboard/my-courses/${item.courseSlug}`)}>
												<Play className="h-3.5 w-3.5" />
												{t("dashboard.orders.openCourse")}
											</a>
										</Button>
									)}
							</div>
						</div>
					))}

					<div className="border-t pt-5 text-sm">
						<div className="flex justify-between gap-4 font-semibold">
							<span>{t("dashboard.orders.total")}</span>
							<span>{formatPrice(order.totalInCents, order.currency)}</span>
						</div>
						<div className="mt-4 space-y-1 text-muted-foreground">
							<p>{t("dashboard.orders.deliveryEmail", { email: order.email })}</p>
							{order.invoiceNumber && (
								<p>{t("dashboard.orders.invoiceNumber", { number: order.invoiceNumber })}</p>
							)}
							<p className="break-all">{t("dashboard.orders.orderId", { id: order.id })}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
