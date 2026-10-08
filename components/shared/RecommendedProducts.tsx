"use client";

import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { AffiliateDisclosure } from "@/components/shared/AffiliateDisclosure";
import { linkAttributes } from "@/lib/affiliate";
import { useI18n } from "@/lib/i18n/react";
import type { RecommendedProduct } from "@/types/sanity";

interface RecommendedProductsProps {
	title: string;
	products?: RecommendedProduct[];
	/** Sub-ID for affiliate reports, usually the page slug. */
	label: string;
	id?: string;
	showDisclosure?: boolean;
}

export function RecommendedProducts({
	title,
	products,
	label,
	id,
	showDisclosure = true,
}: RecommendedProductsProps) {
	const { t } = useI18n();
	if (!products || products.length === 0) return null;

	return (
		<section className="mt-12">
			<h2 id={id} className="mb-6 scroll-mt-24 font-serif text-2xl font-bold">
				{title}
			</h2>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{products.map((product) => {
					const link = linkAttributes(product.url, label);
					return (
						<li
							key={product._key}
							className="flex gap-4 rounded-xl border border-border bg-card p-4"
						>
							{product.image && (
								<OptimizedImage
									image={product.image}
									alt={product.name}
									width={160}
									height={160}
									sizes="96px"
									className="h-24 w-24 shrink-0 rounded-lg object-cover"
								/>
							)}
							<div className="flex min-w-0 flex-col">
								<h3 className="font-semibold leading-snug">{product.name}</h3>
								{product.note && (
									<p className="mt-1 text-sm text-muted-foreground">{product.note}</p>
								)}
								<a
									href={link.href}
									target={link.target}
									rel={link.rel}
									className="mt-auto pt-3 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
								>
									{product.merchant
										? t("common.affiliate.seeAt", { shop: product.merchant })
										: t("common.affiliate.see")}
								</a>
							</div>
						</li>
					);
				})}
			</ul>
			{showDisclosure && <AffiliateDisclosure className="mt-4" />}
		</section>
	);
}
