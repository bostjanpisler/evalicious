import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

let _ses: SESv2Client | null = null;

function getSes(): SESv2Client {
	if (!_ses) {
		const accessKeyId = process.env.SES_ACCESS_KEY_ID;
		const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY;
		if (!accessKeyId || !secretAccessKey) throw new Error("SES is not configured");
		_ses = new SESv2Client({
			region: process.env.SES_REGION ?? "eu-central-1",
			credentials: { accessKeyId, secretAccessKey },
		});
	}
	return _ses;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Eva <hello@eva-licious.com>";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO;

export function buildSendEmailInput(message: { to: string; subject: string; html: string }) {
	return {
		FromEmailAddress: EMAIL_FROM,
		Destination: { ToAddresses: [message.to] },
		...(EMAIL_REPLY_TO ? { ReplyToAddresses: [EMAIL_REPLY_TO] } : {}),
		...(process.env.SES_CONFIGURATION_SET
			? { ConfigurationSetName: process.env.SES_CONFIGURATION_SET }
			: {}),
		Content: {
			Simple: {
				Subject: { Data: message.subject, Charset: "UTF-8" },
				Body: { Html: { Data: message.html, Charset: "UTF-8" } },
			},
		},
	};
}

async function sendEmail(message: { to: string; subject: string; html: string }): Promise<void> {
	await getSes().send(new SendEmailCommand(buildSendEmailInput(message)));
}

export async function sendPurchaseConfirmation(
	to: string,
	productName: string,
	downloadUrl?: string,
) {
	await sendEmail({
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
	await sendEmail({
		to,
		subject: "Welcome to Eva-licious!",
		html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining Eva-licious. Explore recipes, save your favorites, and more!</p>
    `,
	});
}
