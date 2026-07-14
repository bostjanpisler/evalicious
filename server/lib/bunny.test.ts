import { afterEach, describe, expect, test } from "bun:test";
import { generateBunnyEmbedUrl } from "./bunny";

const originalLibrary = process.env.BUNNY_STREAM_LIBRARY_ID;
const originalToken = process.env.BUNNY_STREAM_TOKEN_KEY;

afterEach(() => {
	process.env.BUNNY_STREAM_LIBRARY_ID = originalLibrary;
	process.env.BUNNY_STREAM_TOKEN_KEY = originalToken;
});

describe("Bunny signing", () => {
	test("fails closed without signing credentials", () => {
		delete process.env.BUNNY_STREAM_LIBRARY_ID;
		delete process.env.BUNNY_STREAM_TOKEN_KEY;
		expect(() => generateBunnyEmbedUrl("video_1")).toThrow("not configured");
	});

	test("generates a signed URL with configured identifiers", () => {
		process.env.BUNNY_STREAM_LIBRARY_ID = "12345";
		process.env.BUNNY_STREAM_TOKEN_KEY = "secret";
		expect(generateBunnyEmbedUrl("video_1")).toStartWith(
			"https://iframe.mediadelivery.net/embed/12345/video_1?token=",
		);
	});
});
