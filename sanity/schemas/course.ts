import { defineType, defineField, defineArrayMember } from "sanity";

export const course = defineType({
	name: "course",
	title: "Course",
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
			name: "coverImage",
			title: "Cover Image",
			type: "image",
			options: { hotspot: true },
		}),
		defineField({
			name: "steps",
			title: "Steps",
			type: "array",
			of: [
				defineArrayMember({
					type: "reference",
					to: [{ type: "lesson" }],
				}),
			],
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
			options: { layout: "tags" },
		}),
		defineField({
			name: "published",
			title: "Published",
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
		}),
	],
	preview: {
		select: { title: "title", media: "coverImage" },
	},
});
