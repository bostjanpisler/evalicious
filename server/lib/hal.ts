import type { Locale } from "@/lib/i18n/config";
const HAL_API_BASE = process.env.HAL_API_BASE ?? "https://api.chatwithhal.com/api/v1";
const HAL_TIMEOUT_MS = 15_000;
// "Lead" stage of the Evalicious Hal project.
const DEFAULT_CRM_STAGE_ID = "cmuxrzm9d0ez82po7now5g8ba";

type Metadata = Record<string, string | number | boolean | null>;
type HalContact = { id: string; tags: string[] | null };
type HalCompany = { id: string; name: string; stage_id: string | null };

type HalHttp = (method: "GET" | "POST" | "PATCH", path: string, body?: unknown) => Promise<unknown>;

export function isHalConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
	return !!env.HAL_API_KEY?.trim();
}

function createHalHttp(apiKey: string): HalHttp {
	return async (method, path, body) => {
		const response = await fetch(`${HAL_API_BASE}${path}`, {
			method,
			signal: AbortSignal.timeout(HAL_TIMEOUT_MS),
			headers: {
				"X-API-Key": apiKey,
				...(body === undefined ? {} : { "content-type": "application/json" }),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		const text = await response.text();
		if (!response.ok)
			throw new Error(`Hal ${method} ${path} ${response.status}: ${text.slice(0, 200)}`);
		return text ? (JSON.parse(text) as unknown) : {};
	};
}

export function mergeTags(existing: string[] | null | undefined, added: string[]): string[] {
	return [...new Set([...(existing ?? []), ...added])];
}

export type FreeDownloadLeadSync = {
	leadId: string;
	email: string;
	name: string;
	userId: string;
	productSlug: string;
	productTitle: string;
	consentedAt: Date;
	locale?: Locale;
};

export type FreeDownloadEmailRequest = {
	leadId: string;
	email: string;
	productSlug: string;
	productTitle: string;
	downloadToken: string;
	needsAccount: boolean;
	name: string;
	locale?: Locale;
};

/**
 * Asks Hal to email the download link. The `free-download-requested` event
 * triggers the "Brezplačen prenos" workflow, which renders the branded email
 * from these contact properties. This is a service email, so it carries no
 * marketing consent: that is only recorded once the link is opened
 * (syncFreeDownloadLeadToHal).
 */
export async function requestFreeDownloadEmail(
	request: FreeDownloadEmailRequest,
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<void> {
	if (!env.HAL_API_KEY?.trim()) throw new Error("Hal is not configured");
	await http("POST", "/events/track", {
		// One workflow per language renders the email in that language.
		name: request.locale === "en" ? "free-download-requested-en" : "free-download-requested",
		event_key: `free-download-requested:${request.leadId}`,
		entity: "visitor",
		email: request.email.toLowerCase(),
		contact_name: request.name,
		value: request.productSlug,
		metadata: {
			download_title: request.productTitle,
			download_token: request.downloadToken,
			needs_account: request.needsAccount ? "yes" : "no",
			language: request.locale ?? "sl",
		},
		overwrite_metadata: true,
	});
}

type MarketingContact = {
	email: string;
	name: string;
	/** Our user id, when the contact has an account. */
	userId?: string;
	/** Stable id of the CRM company for this contact. */
	companyId: string;
	eventName: string;
	eventKey: string;
	eventValue?: string;
	at: Date;
	locale: Locale;
	source: string;
	tags: string[];
	metadata?: Metadata;
};

/**
 * One tracked event creates (or finds) the Hal contact by email, a CRM company, and
 * links them; it is idempotent via event_key and can trigger Hal workflows. Tags and
 * the CRM stage are then set separately because the event API doesn't cover them.
 * The stage is only set when the company has none, so a contact already further down
 * the pipeline is never moved back to "Lead".
 */
async function syncMarketingContact(
	contact: MarketingContact,
	env: NodeJS.ProcessEnv,
	http: HalHttp,
): Promise<{ contactId: string }> {
	if (!env.HAL_API_KEY?.trim()) throw new Error("Hal is not configured");
	const email = contact.email.toLowerCase();
	const at = contact.at.toISOString();

	const tracked = (await http("POST", "/events/track", {
		name: contact.eventName,
		event_key: contact.eventKey,
		entity: "visitor",
		...(contact.userId ? { user_id: contact.userId } : {}),
		email,
		contact_name: contact.name,
		...(contact.eventValue ? { value: contact.eventValue } : {}),
		occurred_at: at,
		company_id: contact.companyId,
		company: {
			name: email,
			metadata: { ...(contact.userId ? { user_id: contact.userId } : {}), source: contact.source },
		},
		metadata: {
			marketing_consent: true,
			language: contact.locale,
			marketing_consent_at: at,
			...contact.metadata,
		},
		overwrite_metadata: true,
	})) as { event?: { contact_id?: string | null } };
	const contactId = tracked.event?.contact_id;
	if (!contactId) throw new Error("Hal track event returned no contact");

	const { contact: existing } = (await http(
		"GET",
		`/contacts/${encodeURIComponent(contactId)}`,
	)) as {
		contact: HalContact;
	};
	const tags = mergeTags(existing.tags, [
		"eva-licious",
		"marketing-consent",
		...contact.tags,
		`lang:${contact.locale}`,
	]);
	if (tags.length !== (existing.tags?.length ?? 0)) {
		await http("PATCH", `/contacts/${encodeURIComponent(contactId)}`, { tags });
	}

	const { companies } = (await http(
		"GET",
		`/companies?search=${encodeURIComponent(email)}&limit=10`,
	)) as { companies: HalCompany[] };
	const company = companies.find((entry) => entry.name.toLowerCase() === email);
	if (company && !company.stage_id) {
		await http("PATCH", `/companies/${encodeURIComponent(company.id)}`, {
			stage_id: env.HAL_CRM_STAGE_ID?.trim() || DEFAULT_CRM_STAGE_ID,
		});
	}

	return { contactId };
}

export async function syncFreeDownloadLeadToHal(
	lead: FreeDownloadLeadSync,
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<{ contactId: string }> {
	const locale = lead.locale ?? "sl";
	const at = lead.consentedAt.toISOString();
	return syncMarketingContact(
		{
			email: lead.email,
			name: lead.name,
			userId: lead.userId,
			companyId: lead.userId,
			eventName: "free-download-confirmed",
			eventKey: `free-download-confirmed:${lead.leadId}`,
			eventValue: lead.productSlug,
			at: lead.consentedAt,
			locale,
			source: "free_download",
			tags: ["free-download", `download:${lead.productSlug}`],
			metadata: { last_free_download: lead.productSlug, last_free_download_at: at },
		},
		env,
		http,
	);
}

export type NewsletterSignupSync = {
	signupId: string;
	email: string;
	name: string;
	consentedAt: Date;
	locale?: Locale;
	source: string;
};

export async function syncNewsletterSubscriberToHal(
	signup: NewsletterSignupSync,
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<{ contactId: string }> {
	return syncMarketingContact(
		{
			email: signup.email,
			name: signup.name,
			companyId: `subscriber:${signup.signupId}`,
			eventName: "newsletter-confirmed",
			eventKey: `newsletter-confirmed:${signup.signupId}`,
			at: signup.consentedAt,
			locale: signup.locale ?? "sl",
			source: signup.source,
			tags: ["newsletter"],
			metadata: { newsletter_source: signup.source },
		},
		env,
		http,
	);
}

/** Asks Hal to email the double opt-in confirmation link (a service email: no consent yet). */
export async function requestNewsletterConfirmation(
	request: { signupId: string; email: string; name: string; token: string; locale?: Locale },
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<void> {
	if (!env.HAL_API_KEY?.trim()) throw new Error("Hal is not configured");
	await http("POST", "/events/track", {
		name:
			request.locale === "en" ? "newsletter-confirm-requested-en" : "newsletter-confirm-requested",
		event_key: `newsletter-confirm-requested:${request.signupId}`,
		entity: "visitor",
		email: request.email.toLowerCase(),
		contact_name: request.name,
		metadata: { confirm_token: request.token, language: request.locale ?? "sl" },
		overwrite_metadata: false,
	});
}

/**
 * Starts the welcome series for a contact who has just confirmed consent to news.
 * Idempotent per address, so a second sign-up or download never restarts it.
 */
export async function startWelcomeSeries(
	contact: { email: string; locale?: Locale },
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<void> {
	if (!env.HAL_API_KEY?.trim()) throw new Error("Hal is not configured");
	const email = contact.email.toLowerCase();
	await http("POST", "/events/track", {
		name: contact.locale === "en" ? "welcome-series-start-en" : "welcome-series-start",
		event_key: `welcome-series:${email}`,
		entity: "visitor",
		email,
	});
}
