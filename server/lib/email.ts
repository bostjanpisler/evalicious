import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
	if (!_resend) {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
		_resend = new Resend(apiKey);
	}
	return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Eva <hello@eva-licious.com>";

export function assertEmailSent(result: { error: { message: string } | null }, kind: string): void {
	if (result.error) {
		throw new Error(`${kind} email failed: ${result.error.message}`);
	}
}

export async function sendPurchaseConfirmation(
	to: string,
	productName: string,
	downloadUrl?: string,
	idempotencyKey?: string,
) {
	const result = await getResend().emails.send(
		{
			from: EMAIL_FROM,
			to,
			subject: `Your purchase: ${productName}`,
			html: `
      <h1>Thank you for your purchase!</h1>
      <p>You've successfully purchased <strong>${productName}</strong>.</p>
      ${downloadUrl ? `<p><a href="${downloadUrl}">Download your file</a></p><p>This link expires in 24 hours.</p>` : "<p>You can access your content from your dashboard.</p>"}
    `,
		},
		idempotencyKey ? { idempotencyKey } : undefined,
	);
	assertEmailSent(result, "Purchase confirmation");
}

export async function sendWelcomeEmail(to: string, name: string) {
	const result = await getResend().emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Welcome to Eva-licious!",
		html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining Eva-licious. Explore recipes, save your favorites, and more!</p>
    `,
	});
	assertEmailSent(result, "Welcome");
}
