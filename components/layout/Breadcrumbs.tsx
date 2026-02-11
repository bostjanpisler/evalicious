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

interface BreadcrumbSegment {
	label: string;
	href?: string;
}

interface BreadcrumbsProps {
	segments: BreadcrumbSegment[];
}

export function Breadcrumbs({ segments }: BreadcrumbsProps) {
	const allSegments = [{ label: "Domov", href: "/" }, ...segments];

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
									<BreadcrumbLink href={segment.href}>{segment.label}</BreadcrumbLink>
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
							...(segment.href ? { item: segment.href } : {}),
						})),
					}),
				}}
			/>
		</>
	);
}
