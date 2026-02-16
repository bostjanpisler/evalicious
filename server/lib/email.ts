import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
	if (!_resend) {
		_resend = new Resend(process.env.RESEND_API_KEY);
	}
	return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Eva <hello@eva-licious.com>";

export async function sendPurchaseConfirmation(
	to: string,
	productName: string,
	downloadUrl?: string,
) {
	await getResend().emails.send({
		from: EMAIL_FROM,
		to,
		subject: `Your purchase: ${productName}`,
		html: `
      <h1>Thank you for your purchase!</h1>
      <p>You've successfully purchased <strong>${productName}</strong>.</p>
      ${downloadUrl ? `<p><a href="${downloadUrl}">Download your file</a></p><p>This link expires in 24 hours.</p>` : "<p>You can access your content from your dashboard.</p>"}
    `,
	});
}

export async function sendWelcomeEmail(to: string, name: string) {
	await getResend().emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Welcome to Eva-licious!",
		html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining Eva-licious. Explore recipes, save your favorites, and more!</p>
    `,
	});
}
