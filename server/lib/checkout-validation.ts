export function checkoutProductSlug(body: unknown): string | null {
	if (!body || typeof body !== "object" || !("productSlug" in body)) return null;
	const productSlug = (body as { productSlug?: unknown }).productSlug;
	return typeof productSlug === "string" && /^[a-z0-9-]{1,100}$/i.test(productSlug)
		? productSlug
		: null;
}

export function paymentMatchesProduct(
	session: { amountTotal: number | null; currency: string | null },
	product: { priceInCents: number; currency: string },
): boolean {
	return (
		session.amountTotal === product.priceInCents &&
		session.currency?.toUpperCase() === product.currency.toUpperCase()
	);
}
