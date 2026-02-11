import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { db } from "@/server/lib/db";
import { auth } from "@/server/lib/auth";
import { productBySlugQuery } from "@/lib/sanity.queries";
import type { Product } from "@/types/sanity";
import { render } from "vike/abort";

export type Data = Product & {
	owned: boolean;
	ownershipTarget?: string;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const product = await sanityClient.fetch<Product>(productBySlugQuery, { slug });
	if (!product) throw render(404, "Product not found");

	let owned = false;
	let ownershipTarget: string | undefined;

	const headers = (pageContext as Record<string, unknown>).headersOriginal as
		| Headers
		| undefined;

	if (headers) {
		try {
			const session = await auth.api.getSession({ headers });
			if (session?.user) {
				const orderWithProduct = await db.order.findFirst({
					where: {
						userId: session.user.id,
						status: "completed",
						items: { some: { product: { slug } } },
					},
				});

				if (orderWithProduct) {
					owned = true;
					if (product.type === "ecourse" && product.course?.slug) {
						ownershipTarget = `/dashboard/my-courses/${product.course.slug}`;
					} else {
						ownershipTarget = "/dashboard/my-orders";
					}
				}
			}
		} catch {
			// Not logged in, owned stays false
		}
	}

	return { ...product, owned, ownershipTarget };
}
