import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { aboutPageQuery } from "@/lib/sanity.queries";
import type { AboutPage } from "@/types/sanity";

export type Data = AboutPage;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const page =
		(await sanityClient.fetch<AboutPage>(aboutPageQuery, { locale })) ??
		(locale === DEFAULT_LOCALE
			? null
			: await sanityClient.fetch<AboutPage>(aboutPageQuery, { locale: DEFAULT_LOCALE }));
	return page ?? { bio: [], socialLinks: [] };
}
