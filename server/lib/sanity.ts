import { createClient, type QueryParams, type SanityClient } from "@sanity/client";

let _client: SanityClient | null = null;
let _configured = false;

export function getSanityClient(): SanityClient {
	if (!_client) {
		const projectId = process.env.SANITY_PROJECT_ID;
		_configured = !!projectId;
		_client = createClient({
			projectId: projectId ?? "placeholder",
			dataset: process.env.SANITY_DATASET ?? "production",
			apiVersion: "2024-01-01",
			useCdn: process.env.NODE_ENV === "production",
			token: process.env.SANITY_API_TOKEN,
		});
	}
	return _client;
}

export const sanityClient = {
	async fetch<T>(query: string, params?: QueryParams): Promise<T | null> {
		if (!process.env.SANITY_PROJECT_ID) {
			console.warn("[sanity] SANITY_PROJECT_ID not set, returning null");
			return null;
		}
		return params ? getSanityClient().fetch<T>(query, params) : getSanityClient().fetch<T>(query);
	},
};
