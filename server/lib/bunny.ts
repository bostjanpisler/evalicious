import { createHash } from "node:crypto";

export function generateBunnyEmbedUrl(videoId: string): string {
	const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
	const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;
	if (!libraryId || !tokenKey) {
		throw new Error("Bunny Stream signing is not configured");
	}
	if (!/^[A-Za-z0-9_-]+$/.test(videoId) || !/^\d+$/.test(libraryId)) {
		throw new Error("Invalid Bunny Stream identifiers");
	}
	const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
	const token = createHash("sha256")
		.update(tokenKey + videoId + String(expires))
		.digest("hex");

	return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
}
