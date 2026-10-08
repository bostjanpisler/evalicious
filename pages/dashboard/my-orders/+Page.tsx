import { BookOpen, Download, Play, ShoppingBag } from "lucide-react";
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

export default function MyOrdersPage() {
	const { orders } = useData<Data>();
	const { t, l, formatDate, locale } = useI18n();
	const priceLocale = locale === "en" ? "en-GB" : "sl-SI";
	const label = (keys: Record<string, TranslationKey>, value: string) => {
		const key = keys[value];
		return key ? t(key) : value;
	};

	if (orders.length === 0) {
		return (
			<div>
				<h2 className="font-serif text-2xl font-bold mb-6">{t("dashboard.orders.heading")}</h2>
				<div className="text-center py-16">
					<ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
					<h3 className="mt-4 font-serif text-lg font-semibold text-muted-foreground">
						{t("dashboard.orders.emptyTitle")}
					</h3>
					<p className="mt-2 text-sm text-muted-foreground">{t("dashboard.orders.emptyText")}</p>
					<a
						href={l("/shop")}
						className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
					>
						{t("dashboard.orders.goToShop")}
					</a>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h2 className="font-serif text-2xl font-bold mb-6">{t("dashboard.orders.heading")}</h2>

			<div className="space-y-4">
				{orders.map((order) => (
					<div key={order.id} className="rounded-lg border bg-card p-5">
						<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
							<div className="flex items-center gap-3">
								<span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
								<Badge
									variant={order.status === "completed" ? "default" : "secondary"}
									className="text-xs"
								>
									{label(statusKeys, order.status)}
								</Badge>
							</div>
							<span className="text-sm font-semibold">
								{formatPrice(order.totalInCents, order.currency, priceLocale)}
							</span>
						</div>

						{order.items.map((item) => (
							<div key={item.id} className="flex flex-wrap items-center justify-between gap-3">
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
											href={l(`/shop/${item.productSlug}`)}
											className="text-sm font-medium hover:text-primary"
										>
											{item.productName}
										</a>
										<p className="text-xs text-muted-foreground">
											{label(typeKeys, item.productType)}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
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
													{t("dashboard.orders.goToCourse")}
												</a>
											</Button>
										)}
								</div>
							</div>
						))}

						<div className="mt-4 border-t pt-4 text-right">
							<a
								href={l(`/dashboard/my-orders/${order.id}`)}
								className="text-sm font-medium text-amber-700 transition-colors hover:text-amber-800"
							>
								{t("dashboard.orders.viewDetails")}
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
