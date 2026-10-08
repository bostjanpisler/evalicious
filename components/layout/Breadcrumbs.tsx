"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { SITE_URL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/react";

interface BreadcrumbSegment {
	label: string;
	href?: string;
}

interface BreadcrumbsProps {
	segments: BreadcrumbSegment[];
}

export function Breadcrumbs({ segments }: BreadcrumbsProps) {
	const { t, l } = useI18n();
	const allSegments = [{ label: t("common.home"), href: "/" }, ...segments];

	return (
		<>
			<Breadcrumb>
				<BreadcrumbList>
					{allSegments.map((segment, index) => (
						<Fragment key={segment.label}>
							{index > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{index === allSegments.length - 1 ? (
									<BreadcrumbPage>{segment.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={segment.href ? l(segment.href) : undefined}>
										{segment.label}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: allSegments.map((segment, index) => ({
							"@type": "ListItem",
							position: index + 1,
							name: segment.label,
							...(segment.href ? { item: `${SITE_URL}${l(segment.href)}` } : {}),
						})),
					}),
				}}
			/>
		</>
	);
}
