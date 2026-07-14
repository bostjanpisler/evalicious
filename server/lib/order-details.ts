export interface OrderProductRecord {
	sanityId: string;
	slug: string;
	type: string;
}

export interface OrderItemRecord {
	id: string;
	priceInCents: number;
	product: OrderProductRecord;
}

export interface OrderRecord {
	id: string;
	status: string;
	totalInCents: number;
	currency: string;
	email: string;
	createdAt: Date;
	spaceInvoiceNumber: string | null;
	items: OrderItemRecord[];
}

export interface ProductMetadata {
	_id: string;
	title: string;
	courseSlug?: string;
}

export interface OrderDetail {
	id: string;
	status: string;
	totalInCents: number;
	currency: string;
	email: string;
	createdAt: string;
	invoiceNumber?: string;
	items: Array<{
		id: string;
		priceInCents: number;
		productSlug: string;
		productType: string;
		productName: string;
		courseSlug?: string;
	}>;
}

interface OrderDetailDependencies {
	findOwnedOrder: (orderId: string, userId: string) => Promise<OrderRecord | null>;
	findProductMetadata: (sanityIds: string[]) => Promise<ProductMetadata[]>;
}

/**
 * Loads an order through an ownership-scoped lookup, then enriches its immutable
 * purchase records with the current product title and course slug from Sanity.
 */
export async function loadOwnedOrderDetail(
	dependencies: OrderDetailDependencies,
	orderId: string,
	userId: string,
): Promise<OrderDetail | null> {
	const order = await dependencies.findOwnedOrder(orderId, userId);
	if (!order) return null;

	const sanityIds = [...new Set(order.items.map((item) => item.product.sanityId))];
	const products = sanityIds.length > 0 ? await dependencies.findProductMetadata(sanityIds) : [];
	const metadataById = new Map(products.map((product) => [product._id, product]));

	return {
		id: order.id,
		status: order.status,
		totalInCents: order.totalInCents,
		currency: order.currency,
		email: order.email,
		createdAt: order.createdAt.toISOString(),
		invoiceNumber: order.spaceInvoiceNumber ?? undefined,
		items: order.items.map((item) => {
			const metadata = metadataById.get(item.product.sanityId);
			return {
				id: item.id,
				priceInCents: item.priceInCents,
				productSlug: item.product.slug,
				productType: item.product.type,
				productName: metadata?.title ?? item.product.slug,
				courseSlug: metadata?.courseSlug,
			};
		}),
	};
}
