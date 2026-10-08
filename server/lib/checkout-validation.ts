import { DEFAULT_LOCALE, ENGLISH_ENABLED, isLocale, type Locale } from "@/lib/i18n/config";

export function checkoutLocale(body: unknown): Locale {
	const locale =
		body && typeof body === "object" ? (body as { locale?: unknown }).locale : undefined;
	return ENGLISH_ENABLED && isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/** The buyer must tick the terms / immediate-delivery checkbox: it waives the 14-day withdrawal right for digital content. */
export function checkoutTermsAccepted(body: unknown): boolean {
	return (
		!!body &&
		typeof body === "object" &&
		(body as { acceptedTerms?: unknown }).acceptedTerms === true
	);
}

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
