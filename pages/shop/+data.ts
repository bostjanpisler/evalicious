import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { allProductsQuery } from "@/lib/sanity.queries";
import type { Product } from "@/types/sanity";

export type Data = { products: Product[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const products = await sanityClient.fetch<Product[]>(allProductsQuery, { locale });
	return { products: products ?? [] };
}
