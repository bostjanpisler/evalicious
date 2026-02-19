"use client";

import { useEffect } from "react";
import { useData } from "vike-react/useData";
import { CheckCircle, Download, Play, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import type { Data } from "./+data.server";

export default function CheckoutSuccessPage() {
	const { productName, productType, courseSlug, orderId } = useData<Data>();

	useEffect(() => {
		posthog.capture("purchase_completed", {
			product_name: productName,
			product_type: productType,
			order_id: orderId,
		});
	}, [orderId, productName, productType]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
			<Card className="mx-auto max-w-lg text-center">
				<CardContent className="p-8">
					<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
					<h1 className="mt-6 font-serif text-3xl font-bold">
						Hvala za nakup!
					</h1>

					{productName && (
						<p className="mt-2 text-lg font-medium text-muted-foreground">
							{productName}
						</p>
					)}

					<p className="mt-3 text-muted-foreground">
						Tvoje naročilo je potrjeno. Potrditev smo poslali na tvoj e-poštni naslov.
					</p>

					<div className="mt-8 flex flex-col gap-3">
						{productType === "ebook" && orderId && (
							<a href={`/api/download/${orderId}`}>
								<Button size="lg" className="w-full gap-2">
									<Download className="h-4 w-4" />
									Prenesi svojo e-knjigo
								</Button>
							</a>
						)}

						{productType === "ecourse" && courseSlug && (
							<a href={`/dashboard/my-courses/${courseSlug}`}>
								<Button size="lg" className="w-full gap-2">
									<Play className="h-4 w-4" />
									Začni tečaj
								</Button>
							</a>
						)}

						<a href="/dashboard/my-orders">
							<Button variant="outline" className="w-full gap-2">
								<ShoppingBag className="h-4 w-4" />
								Moja naročila
							</Button>
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
