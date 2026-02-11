import { defineType, defineField, defineArrayMember } from "sanity";

export const lesson = defineType({
	name: "lesson",
	title: "Lesson",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "title", maxLength: 96 },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "sortOrder",
			title: "Sort Order",
			type: "number",
		}),
		defineField({
			name: "bunnyVideoId",
			title: "Bunny Video ID",
			type: "string",
			description: "The Bunny Stream video GUID",
		}),
		defineField({
			name: "pdfFile",
			title: "PDF File",
			type: "file",
		}),
		defineField({
			name: "durationMinutes",
			title: "Duration (minutes)",
			type: "number",
		}),
		defineField({
			name: "isFree",
			title: "Is Free",
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			name: "content",
			title: "Content",
			type: "array",
			of: [defineArrayMember({ type: "block" })],
		}),
	],
	preview: {
		select: { title: "title", subtitle: "sortOrder" },
		prepare({ title, subtitle }) {
			return {
				title,
				subtitle: subtitle != null ? `Step ${subtitle}` : undefined,
			};
		},
	},
});
