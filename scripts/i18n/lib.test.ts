import { describe, expect, test } from "bun:test";
import {
	applyCanonicalLabels,
	applyTranslations,
	canonicalizeLabels,
	extractUnits,
	slugifyEnglish,
	suspiciousUnits,
} from "./lib";

const recipe = {
	_id: "r1",
	_type: "recipe",
	title: "Ovsena kaša",
	description: "Hiter zajtrk.",
	cuisine: "Slovenska",
	difficulty: "easy",
	tags: ["zajtrk", "hitro"],
	servings: 2,
	ingredientGroups: [
		{
			groupName: "Za kašo",
			items: [{ name: "ovseni kosmiči", amount: "1", unit: "skodelica", optional: false }],
		},
	],
	stepGroups: [{ items: [{ instruction: "Skuhaj.", tip: "Dodaj sol." }] }],
	content: [
		{
			_type: "block",
			_key: "b1",
			style: "normal",
			markDefs: [{ _key: "l1", _type: "link", href: "https://example.com" }],
			children: [
				{ _type: "span", _key: "s1", text: "To je ", marks: [] },
				{ _type: "span", _key: "s2", text: "pomembno", marks: ["strong"] },
				{ _type: "span", _key: "s3", text: ".", marks: [] },
			],
		},
		{
			_type: "image",
			_key: "i1",
			asset: { _ref: "image-abc" },
			alt: "Skleda",
			caption: "Moja skleda",
		},
		{ _type: "htmlEmbed", _key: "e1", code: "<iframe></iframe>", title: "Zemljevid" },
	],
};

describe("extractUnits", () => {
	test("finds strings and rich-text blocks, and nothing structural", () => {
		const units = extractUnits(recipe);
		const keys = units.map((u) => u.key);
		expect(keys).toEqual([
			"title",
			"description",
			"cuisine",
			"tags.0",
			"tags.1",
			"ingredientGroups.0.groupName",
			"ingredientGroups.0.items.0.name",
			"ingredientGroups.0.items.0.amount",
			"ingredientGroups.0.items.0.unit",
			"stepGroups.0.items.0.instruction",
			"stepGroups.0.items.0.tip",
			"content.0",
			"content.1.alt",
			"content.1.caption",
			"content.2.title",
		]);
		expect(units.find((u) => u.key === "content.0")).toEqual({
			key: "content.0",
			spans: ["To je ", "pomembno", "."],
		});
	});

	test("does not modify the source document", () => {
		const copy = structuredClone(recipe);
		extractUnits(recipe);
		expect(recipe).toEqual(copy);
	});
});

describe("applyTranslations", () => {
	const translated = [
		{ key: "title", text: "Oat porridge" },
		{ key: "description", text: "A quick breakfast." },
		{ key: "cuisine", text: "Slovenian" },
		{ key: "tags.0", text: "breakfast" },
		{ key: "tags.1", text: "quick" },
		{ key: "ingredientGroups.0.groupName", text: "For the porridge" },
		{ key: "ingredientGroups.0.items.0.name", text: "rolled oats" },
		{ key: "ingredientGroups.0.items.0.amount", text: "1" },
		{ key: "ingredientGroups.0.items.0.unit", text: "cup" },
		{ key: "stepGroups.0.items.0.instruction", text: "Cook." },
		{ key: "stepGroups.0.items.0.tip", text: "Add salt." },
		{ key: "content.0", spans: ["This is ", "important", "."] },
		{ key: "content.1.alt", text: "Bowl" },
		{ key: "content.1.caption", text: "My bowl" },
		{ key: "content.2.title", text: "Map" },
	];

	test("puts the translations back and leaves structure, marks and assets alone", () => {
		const result = applyTranslations(recipe, translated);
		expect(result.title).toBe("Oat porridge");
		expect(result.tags).toEqual(["breakfast", "quick"]);
		expect(result.ingredientGroups[0].items[0]).toEqual({
			name: "rolled oats",
			amount: "1",
			unit: "cup",
			optional: false,
		});
		expect(result.content[0].children.map((c: { text: string }) => c.text)).toEqual([
			"This is ",
			"important",
			".",
		]);
		expect(result.content[0].children[1].marks).toEqual(["strong"]);
		expect(result.content[0].markDefs).toEqual(recipe.content[0].markDefs);
		expect(result.content[1].asset).toEqual({ _ref: "image-abc" });
		expect(result.content[2].code).toBe("<iframe></iframe>");
		expect(result.difficulty).toBe("easy");
		expect(result.servings).toBe(2);
		expect(recipe.title).toBe("Ovsena kaša");
	});

	test("refuses incomplete or mismatched translations", () => {
		expect(() => applyTranslations(recipe, translated.slice(1))).toThrow("Missing translations");
		const wrongSpans = translated.map((u) =>
			u.key === "content.0" ? { key: u.key, spans: ["only one"] } : u,
		);
		expect(() => applyTranslations(recipe, wrongSpans)).toThrow("expected 3 spans");
	});

	test("commerce documents translate into an `en` override", () => {
		const product = {
			_type: "product",
			title: "Knjižica",
			description: "Opis",
			tags: ["a"],
			longDescription: [{ _type: "block", children: [{ _type: "span", text: "Dolgo" }] }],
			priceInCents: 0,
		};
		const units = extractUnits(product, true);
		expect(units.map((u) => u.key)).toEqual([
			"title",
			"description",
			"longDescription.0",
			"tags.0",
		]);
	});
});

describe("review helpers", () => {
	test("flags leftover Slovenian letters and untouched long text", () => {
		const source = [
			{ key: "a", text: "To je dolg stavek, ki ga ni nihče prevedel" },
			{ key: "b", text: "Žlica" },
			{ key: "c", text: "Ovsena kaša" },
		];
		const translated = [
			{ key: "a", text: "To je dolg stavek, ki ga ni nihče prevedel" },
			{ key: "b", text: "Žlica" },
			{ key: "c", text: "Oat porridge" },
		];
		expect(suspiciousUnits(source, translated)).toEqual(["a: contains č/š/ž", "b: contains č/š/ž"]);
	});

	test("makes clean English slugs", () => {
		expect(slugifyEnglish("Oat Porridge & Berries!")).toBe("oat-porridge-and-berries");
		expect(slugifyEnglish("Café crème")).toBe("cafe-creme");
	});
});

describe("canonical labels", () => {
	const doc = (tag: string, cuisine: string) => ({
		source: [
			{ key: "tags.0", text: "pecivo" },
			{ key: "cuisine", text: "Domača" },
			{ key: "title", text: "Kruh" },
		],
		translated: [
			{ key: "tags.0", text: tag },
			{ key: "cuisine", text: cuisine },
			{ key: "title", text: "Bread" },
		],
	});

	test("uses the most common English label for each Slovenian label", () => {
		const docs = [
			doc("pastries", "Homemade"),
			doc("pastries", "Home-style"),
			doc("baked goods", "Homemade"),
		];
		const canonical = canonicalizeLabels(docs);
		expect(canonical.get("pecivo")).toBe("pastries");
		expect(canonical.get("Domača")).toBe("Homemade");
		const fixed = applyCanonicalLabels(docs[2].source, docs[2].translated, canonical);
		expect(fixed).toEqual([
			{ key: "tags.0", text: "pastries" },
			{ key: "cuisine", text: "Homemade" },
			{ key: "title", text: "Bread" },
		]);
	});

	test("breaks ties with the shorter label, then alphabetically", () => {
		const canonical = canonicalizeLabels([
			doc("baked goods", "Homemade"),
			doc("pastries", "Home-style"),
		]);
		expect(canonical.get("pecivo")).toBe("pastries");
		expect(canonical.get("Domača")).toBe("Homemade");
	});
});
