import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { Locale } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";

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

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export async function sendPurchaseConfirmation(
	to: string,
	productName: string,
	downloadUrl?: string,
	locale?: Locale,
) {
	const t = translatorFor(locale);
	const product = escapeHtml(productName);
	await sendEmail({
		to,
		subject: t("common.email.purchaseSubject", { product: productName }),
		html: `
      <h1>${t("common.email.purchaseTitle")}</h1>
      <p>${t("common.email.purchaseBody", { product })}</p>
      ${downloadUrl ? `<p><a href="${escapeHtml(downloadUrl)}">${t("common.email.downloadLink")}</a></p><p>${t("common.email.linkExpires")}</p>` : `<p>${t("common.email.dashboardNote")}</p>`}
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

/** Plain-text operational alert to the site owner. */
export async function sendAlertEmail(to: string, alert: { subject: string; body: string }) {
	await getSes().send(
		new SendEmailCommand({
			FromEmailAddress: EMAIL_FROM,
			Destination: { ToAddresses: [to] },
			Content: {
				Simple: {
					Subject: { Data: alert.subject, Charset: "UTF-8" },
					Body: { Text: { Data: alert.body, Charset: "UTF-8" } },
				},
			},
		}),
	);
}
