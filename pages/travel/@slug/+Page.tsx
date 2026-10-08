import { useData } from "vike-react/useData";
import { useConfig } from "vike-react/useConfig";
import { MapPin, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { RecommendedProducts } from "@/components/shared/RecommendedProducts";
import { AffiliateDisclosure } from "@/components/shared/AffiliateDisclosure";
import { StayBox } from "@/components/travel/StayBox";
import { affiliateUrl, bookingSearchUrl, contentHasAffiliate } from "@/lib/affiliate";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { PortableTextRenderer, extractHeadings } from "@/components/blog/PortableTextRenderer";
import { ProfileSidebar } from "@/components/shared/ProfileSidebar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/react";
import { JsonLd } from "@/components/shared/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { structuredDataImages, urlFor } from "@/lib/sanity.image";
import { articleJsonLd } from "@/lib/structured-data";
import type { Data } from "./+data";

export default function TravelEntryPage() {
	const entry = useData<Data>();
	const config = useConfig();
	const { t, l, formatDate, locale } = useI18n();
	config({
		title: `${entry.title} | Eva-licious`,
		description: entry.description,
		image: entry.coverImage
			? urlFor(entry.coverImage).width(1200).height(630).auto("format").url()
			: undefined,
	});
	const headings = entry.content ? extractHeadings(entry.content) : [];
	const locationLabel = [entry.location, entry.country].filter(Boolean).join(", ");

	const stayDestination = [entry.location, entry.country].filter(Boolean).join(", ");
	const showAffiliateNote =
		contentHasAffiliate(entry.content) ||
		(entry.recommendedProducts?.length ?? 0) > 0 ||
		(!!stayDestination && !!affiliateUrl(bookingSearchUrl(stayDestination), entry.slug));

	const structured = articleJsonLd(entry, {
		url: `${SITE_URL}${l(`/travel/${entry.slug}`)}`,
		locale,
		images: structuredDataImages(entry.coverImage),
	});

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<JsonLd data={structured} />
			<Breadcrumbs
				segments={[{ label: t("travel.title"), href: "/travel" }, { label: entry.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Main content */}
				<div className="lg:col-span-2">
					{entry.coverImage && (
						<OptimizedImage
							image={entry.coverImage}
							alt={entry.title}
							width={900}
							height={506}
							className="w-full rounded-xl object-cover"
							priority
						/>
					)}

					<div className="mt-6">
						<div className="flex flex-wrap items-start gap-2">
							{entry.tags?.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>

						<h1 className="mt-4 font-serif text-4xl font-bold">{entry.title}</h1>

						<div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
							{locationLabel && (
								<span className="flex items-center gap-1.5">
									<MapPin className="h-4 w-4" />
									{locationLabel}
								</span>
							)}
							{entry.publishedAt && (
								<span className="flex items-center gap-1.5">
									<Calendar className="h-4 w-4" />
									{formatDate(entry.publishedAt)}
								</span>
							)}
						</div>
					</div>

					{showAffiliateNote && <AffiliateDisclosure className="mt-6" />}

					{entry.content && (
						<div className="mt-8">
							<PortableTextRenderer
								value={entry.content}
								documentId={entry._id}
								affiliateLabel={entry.slug}
							/>
						</div>
					)}

					<StayBox
						location={entry.location}
						country={entry.country}
						label={entry.slug}
						showDisclosure={false}
					/>
					<RecommendedProducts
						title={t("common.affiliate.recommended")}
						products={entry.recommendedProducts}
						label={entry.slug}
						showDisclosure={false}
					/>
				</div>

				{/* Sidebar */}
				<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
					{headings.length > 0 && <TableOfContents headings={headings} />}
					<ProfileSidebar />
				</div>
			</div>
		</div>
	);
}
