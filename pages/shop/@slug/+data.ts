import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { productBySlugQuery } from "@/lib/sanity.queries";
import type { Product } from "@/types/sanity";
import { render } from "vike/abort";

export type Data = Product;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const product = await sanityClient.fetch<Product>(productBySlugQuery, { slug });
	if (!product) throw render(404, "Product not found");
	return product;
}
