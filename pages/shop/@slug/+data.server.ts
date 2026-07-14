import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { productBySlugQuery } from "@/lib/sanity.queries";
import { auth } from "@/server/lib/auth";
import { db } from "@/server/lib/db";
import { sanityClient } from "@/server/lib/sanity";
import type { Product } from "@/types/sanity";

export type Data = Product & {
	isFree: boolean;
	owned: boolean;
	ownershipTarget?: string;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const product = await sanityClient.fetch<Product>(productBySlugQuery, { slug });
	if (!product) throw render(404, "Product not found");

	const isFree = product.priceInCents <= 0;
	let owned = false;
	let ownershipTarget: string | undefined;

	const headers = pageContext.headers ? new Headers(pageContext.headers) : null;

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

	return { ...product, isFree, owned, ownershipTarget };
}
