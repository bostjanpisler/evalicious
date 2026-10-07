import { describe, expect, test } from "bun:test";
import { buildSendEmailInput } from "./email";

describe("buildSendEmailInput", () => {
	test("sends UTF-8 HTML from the configured sender", () => {
		const input = buildSendEmailInput({ to: "eva@example.com", subject: "Živjo", html: "<p>Hi</p>" });
		expect(input.FromEmailAddress).toContain("@");
		expect(input.Destination).toEqual({ ToAddresses: ["eva@example.com"] });
		expect(input.Content.Simple.Subject).toEqual({ Data: "Živjo", Charset: "UTF-8" });
		expect(input.Content.Simple.Body.Html).toEqual({ Data: "<p>Hi</p>", Charset: "UTF-8" });
	});
});
