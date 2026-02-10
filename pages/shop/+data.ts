import { sanityClient } from "@/server/lib/sanity";
import { allProductsQuery } from "@/lib/sanity.queries";
import type { Product } from "@/types/sanity";

export type Data = { products: Product[] };

export async function data(): Promise<Data> {
	const products = await sanityClient.fetch<Product[]>(allProductsQuery);
	return { products: products ?? [] };
}
