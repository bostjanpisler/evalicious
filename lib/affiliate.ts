import {
	AFFILIATE_NETWORK_HOSTS,
	AFFILIATE_PROGRAM_HOSTS,
	AFFILIATE_RULES,
	type AffiliateRule,
} from "./affiliate-config";

type Rules = Record<string, AffiliateRule>;

function hostMatches(host: string, domain: string): boolean {
	return host === domain || host.endsWith(`.${domain}`);
}

function parseHttpUrl(value: string): URL | null {
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:" ? url : null;
	} catch {
		return null;
	}
}

export function affiliateProgramFor(
	url: string,
	programHosts: Record<string, string[]> = AFFILIATE_PROGRAM_HOSTS,
): string | null {
	const parsed = parseHttpUrl(url);
	if (!parsed) return null;
	for (const [program, domains] of Object.entries(programHosts)) {
		if (domains.some((domain) => hostMatches(parsed.hostname, domain))) return program;
	}
	return null;
}

export function isAffiliateRuleActive(rule: AffiliateRule | undefined): boolean {
	return !!rule && (!!rule.template?.trim() || Object.keys(rule.params ?? {}).length > 0);
}

export function isProgramActive(program: string, rules: Rules = AFFILIATE_RULES): boolean {
	return isAffiliateRuleActive(rules[program]);
}

/** The tracked version of `url`, or null when its program is not configured. */
export function affiliateUrl(
	url: string,
	label: string,
	rules: Rules = AFFILIATE_RULES,
	programHosts: Record<string, string[]> = AFFILIATE_PROGRAM_HOSTS,
): string | null {
	const program = affiliateProgramFor(url, programHosts);
	const rule = program ? rules[program] : undefined;
	if (!rule || !isAffiliateRuleActive(rule)) return null;
	if (rule.template?.trim()) {
		return rule.template
			.replaceAll("{url}", encodeURIComponent(url))
			.replaceAll("{label}", encodeURIComponent(label));
	}
	const parsed = parseHttpUrl(url);
	if (!parsed) return null;
	for (const [key, value] of Object.entries(rule.params ?? {})) parsed.searchParams.set(key, value);
	return parsed.toString();
}

export type LinkAttributes = { href: string; rel?: string; target?: string; sponsored: boolean };

/**
 * Attributes for an outgoing link in editor content: tracked when its program is
 * configured, and always marked rel="sponsored" when it is (or already was) an
 * affiliate link, as Google and consumer law expect.
 */
export function linkAttributes(
	href: string | undefined,
	label: string,
	options: {
		rules?: Rules;
		programHosts?: Record<string, string[]>;
		networkHosts?: string[];
	} = {},
): LinkAttributes {
	const raw = href ?? "";
	const parsed = parseHttpUrl(raw);
	if (!parsed) return { href: raw, sponsored: false };

	const tracked = affiliateUrl(raw, label, options.rules, options.programHosts);
	const networkHosts = options.networkHosts ?? AFFILIATE_NETWORK_HOSTS;
	const trackedHost = tracked ? parseHttpUrl(tracked)?.hostname : undefined;
	const sponsored =
		!!tracked ||
		networkHosts.some((domain) => hostMatches(parsed.hostname, domain)) ||
		(!!trackedHost && networkHosts.some((domain) => hostMatches(trackedHost, domain)));
	return {
		href: tracked ?? raw,
		rel: sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer",
		target: "_blank",
		sponsored,
	};
}

export function bookingSearchUrl(destination: string, language = "sl"): string {
	const params = new URLSearchParams({
		ss: destination,
		lang: language,
		group_adults: "2",
		no_rooms: "1",
	});
	return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

// biome-ignore lint/suspicious/noExplicitAny: Portable Text blocks are loosely typed
type PortableBlock = any;

/**
 * True when editor content contains affiliate placements: links to a known
 * network or program, or an HTML embed (Klook widgets and the like) from one.
 */
export function contentHasAffiliate(
	blocks: PortableBlock[] | undefined,
	networkHosts: string[] = AFFILIATE_NETWORK_HOSTS,
	programHosts: Record<string, string[]> = AFFILIATE_PROGRAM_HOSTS,
	rules: Rules = AFFILIATE_RULES,
): boolean {
	if (!blocks) return false;
	const domains = networkHosts;
	const mentionsNetwork = (text: string) =>
		domains.some((domain) => text.includes(domain)) ||
		Object.entries(programHosts).some(
			([program, list]) => isProgramActive(program, rules) && list.some((d) => text.includes(d)),
		);
	return blocks.some((block) => {
		if (block?._type === "htmlEmbed") return mentionsNetwork(String(block.code ?? ""));
		return (block?.markDefs ?? []).some(
			(mark: PortableBlock) => mark?._type === "link" && mentionsNetwork(String(mark.href ?? "")),
		);
	});
}
