import { defineType, defineField } from "sanity";

export const htmlEmbed = defineType({
	name: "htmlEmbed",
	title: "HTML Embed",
	type: "object",
	fields: [
		defineField({
			name: "code",
			title: "HTML Code",
			type: "text",
			rows: 8,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "title",
			title: "Title (optional label)",
			type: "string",
		}),
	],
	preview: {
		select: { title: "title", code: "code" },
		prepare({ title, code }) {
			return {
				title: title || "HTML Embed",
				subtitle: code?.slice(0, 60) ?? "",
			};
		},
	},
});
