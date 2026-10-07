const HAL_API_BASE = process.env.HAL_API_BASE ?? "https://api.chatwithhal.com/api/v1";
const HAL_TIMEOUT_MS = 15_000;
// "Lead" stage of the Evalicious Hal project.
const DEFAULT_CRM_STAGE_ID = "cmuxrzm9d0ez82po7now5g8ba";

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
		if (!response.ok) throw new Error(`Hal ${method} ${path} ${response.status}: ${text.slice(0, 200)}`);
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
};

/**
 * One tracked event creates (or finds) the Hal contact by user id/email, a CRM
 * company keyed by our user id, and links them; it is idempotent per lead via
 * event_key and can trigger Hal workflows. Tags and the CRM stage are then set
 * separately because the event API doesn't cover them. The stage is only set
 * when the company has none, so a lead already further down the pipeline is
 * never moved back to "Lead".
 */
export async function syncFreeDownloadLeadToHal(
	lead: FreeDownloadLeadSync,
	env: NodeJS.ProcessEnv = process.env,
	http: HalHttp = createHalHttp(env.HAL_API_KEY?.trim() ?? ""),
): Promise<{ contactId: string }> {
	if (!env.HAL_API_KEY?.trim()) throw new Error("Hal is not configured");
	const email = lead.email.toLowerCase();
	const at = lead.consentedAt.toISOString();

	const tracked = (await http("POST", "/events/track", {
		name: "free_download",
		event_key: `free_download:${lead.leadId}`,
		entity: "visitor",
		user_id: lead.userId,
		email,
		contact_name: lead.name,
		value: lead.productSlug,
		occurred_at: at,
		company_id: lead.userId,
		company: { name: email, metadata: { user_id: lead.userId, source: "free_download" } },
		metadata: {
			marketing_consent: true,
			marketing_consent_at: at,
			last_free_download: lead.productSlug,
			last_free_download_at: at,
		},
		overwrite_metadata: true,
	})) as { event?: { contact_id?: string | null } };
	const contactId = tracked.event?.contact_id;
	if (!contactId) throw new Error("Hal track event returned no contact");

	const { contact } = (await http("GET", `/contacts/${encodeURIComponent(contactId)}`)) as {
		contact: HalContact;
	};
	const tags = mergeTags(contact.tags, [
		"eva-licious",
		"free-download",
		"marketing-consent",
		`download:${lead.productSlug}`,
	]);
	if (tags.length !== (contact.tags?.length ?? 0)) {
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
