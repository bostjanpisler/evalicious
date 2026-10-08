import { defineField, defineType } from "sanity";

export const recommendedProduct = defineType({
	name: "recommendedProduct",
	title: "Recommended product",
	type: "object",
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "note",
			title: "Why you recommend it",
			type: "text",
			rows: 2,
		}),
		defineField({
			name: "merchant",
			title: "Shop (optional label, e.g. Amazon)",
			type: "string",
		}),
		defineField({
			name: "url",
			title: "Link",
			description:
				"Product page, or your affiliate link from the network. Booking.com, Amazon and iHerb product links are tracked automatically once the program is set up in lib/affiliate-config.ts.",
			type: "url",
			validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
		}),
		defineField({
			name: "image",
			title: "Image",
			type: "image",
			options: { hotspot: true },
		}),
	],
	preview: {
		select: { title: "name", subtitle: "merchant", media: "image" },
	},
});
