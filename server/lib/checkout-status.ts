export type CheckoutConfirmationStatus = "confirmed" | "processing" | "invalid";

export function checkoutConfirmationStatus(
	paymentStatus: string,
	hasCompletedOrder: boolean,
): CheckoutConfirmationStatus {
	if (paymentStatus !== "paid") return "invalid";
	return hasCompletedOrder ? "confirmed" : "processing";
}
