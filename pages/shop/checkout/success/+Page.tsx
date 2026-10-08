"use client";

import { AlertCircle, CheckCircle, Clock, Download, Play, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useData } from "vike-react/useData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { capture } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n/react";
import type { Data } from "./+data.server";

export default function CheckoutSuccessPage() {
	const { t, l } = useI18n();
	const { status, productName, productType, courseSlug, orderId } = useData<Data>();

	useEffect(() => {
		if (status !== "confirmed") return;
		capture("purchase_completed", {
			product_name: productName,
			product_type: productType,
			order_id: orderId,
		});
	}, [orderId, productName, productType, status]);

	const confirmed = status === "confirmed";
	const processing = status === "processing";

	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
			<Card className="mx-auto max-w-lg text-center">
				<CardContent className="p-8">
					{confirmed ? (
						<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
					) : processing ? (
						<Clock className="mx-auto h-16 w-16 text-amber-500" />
					) : (
						<AlertCircle className="mx-auto h-16 w-16 text-destructive" />
					)}
					<h1 className="mt-6 font-serif text-3xl font-bold">
						{confirmed
							? t("shop.checkout.thanks")
							: processing
								? t("shop.checkout.processingTitle")
								: t("shop.checkout.failedTitle")}
					</h1>

					{productName && (
						<p className="mt-2 text-lg font-medium text-muted-foreground">{productName}</p>
					)}

					<p className="mt-3 text-muted-foreground">
						{confirmed
							? t("shop.checkout.confirmedText")
							: processing
								? t("shop.checkout.processingText")
								: t("shop.checkout.failedText")}
					</p>

					<div className="mt-8 flex flex-col gap-3">
						{confirmed && productType === "ebook" && orderId && (
							<Button asChild size="lg" className="w-full gap-2">
								<a href={`/api/download/${orderId}`}>
									<Download className="h-4 w-4" />
									{t("shop.checkout.downloadEbook")}
								</a>
							</Button>
						)}

						{confirmed && productType === "ecourse" && courseSlug && (
							<Button asChild size="lg" className="w-full gap-2">
								<a href={l(`/dashboard/my-courses/${courseSlug}`)}>
									<Play className="h-4 w-4" />
									{t("shop.checkout.startCourse")}
								</a>
							</Button>
						)}

						<Button asChild variant="outline" className="w-full gap-2">
							<a href={l("/dashboard/my-orders")}>
								<ShoppingBag className="h-4 w-4" />
								{t("shop.checkout.myOrders")}
							</a>
						</Button>
						{!confirmed && (
							<Button asChild variant="outline" className="w-full">
								<a href={l("/shop")}>{t("shop.checkout.backToShop")}</a>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
