import { defineArrayMember, defineField, type FieldDefinition } from "sanity";

export const LANGUAGES = [
	{ id: "sl", title: "Slovenščina" },
	{ id: "en", title: "English" },
] as const;

/**
 * Documents translated as one document per language (recipes, blog posts, travel
 * entries, home and about pages). English documents point at their Slovenian
 * original through `translationOf`. Documents without a language count as Slovenian.
 */
export function languageFields(type: string): FieldDefinition[] {
	return [
		defineField({
			name: "language",
			title: "Language",
			type: "string",
			options: {
				list: LANGUAGES.map((language) => ({ title: language.title, value: language.id })),
				layout: "radio",
			},
			initialValue: "sl",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "translationOf",
			title: "Translation of",
			description: "The Slovenian original this document translates.",
			type: "reference",
			to: [{ type }],
			hidden: ({ document }) => (document?.language ?? "sl") === "sl",
			options: { filter: "coalesce(language, 'sl') == 'sl'" },
		}),
	];
}

/**
 * Commerce documents (products, courses, lessons) stay one document, so purchases
 * and access are not duplicated; the English texts live in an `en` block that
 * overrides the Slovenian fields.
 */
export function englishOverride(fields: FieldDefinition[]): FieldDefinition {
	return defineField({
		name: "en",
		title: "English translation",
		description:
			"Shown on the English site instead of the Slovenian texts above. Leave empty to fall back to Slovenian.",
		type: "object",
		options: { collapsible: true, collapsed: true },
		fields,
	});
}

export const englishTextFields = {
	title: () => defineField({ name: "title", title: "Title", type: "string" }),
	description: () =>
		defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
	tags: () =>
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
		}),
	richText: (name: string, title: string) =>
		defineField({ name, title, type: "array", of: [defineArrayMember({ type: "block" })] }),
};
