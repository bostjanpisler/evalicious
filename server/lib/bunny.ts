import { createHash } from "node:crypto";

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "597412";
const TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_KEY ?? "";

export function generateBunnyEmbedUrl(videoId: string): string {
	const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
	const token = createHash("sha256")
		.update(TOKEN_KEY + videoId + String(expires))
		.digest("hex");

	return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?token=${token}&expires=${expires}`;
}
