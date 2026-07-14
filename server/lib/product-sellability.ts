export const SUPPORTED_DIGITAL_PRODUCT_TYPES = ["ebook", "ecourse"] as const;

type SellableProduct = {
	published: boolean;
	type: string;
	priceInCents: number;
	stripePriceId?: string | null;
	stripeProductId?: string | null;
	r2FileKey?: string | null;
};

export type ProductDeliveryMetadata = { courseId?: string | null };

export function deliveryConfigurationError(
	productType: string,
	environment: Record<string, string | undefined> = process.env,
): string | null {
	if (!environment.RESEND_API_KEY) return "Purchase delivery email is not configured";
	if (
		productType === "ebook" &&
		(!environment.R2_ACCOUNT_ID ||
			!environment.R2_ACCESS_KEY_ID ||
			!environment.R2_SECRET_ACCESS_KEY ||
			!environment.R2_BUCKET_NAME)
	) {
		return "Ebook delivery storage is not configured";
	}
	return null;
}

export function productSellabilityError(
	product: SellableProduct,
	delivery: ProductDeliveryMetadata = {},
	options: { requirePublished?: boolean } = {},
): string | null {
	if (options.requirePublished !== false && !product.published) return "Product is not published";
	if (product.priceInCents < 0) return "Product price is invalid";
	if (!SUPPORTED_DIGITAL_PRODUCT_TYPES.includes(product.type as "ebook" | "ecourse")) {
		return `Unsupported product type ${product.type}`;
	}
	if (product.priceInCents > 0 && (!product.stripePriceId || !product.stripeProductId)) {
		return "Paid product is missing Stripe configuration";
	}
	if (product.type === "ebook" && !product.r2FileKey) {
		return "Ebook is missing its delivery file";
	}
	if (product.type === "ecourse" && !delivery.courseId) {
		return "Course product is missing its linked course";
	}
	return null;
}
