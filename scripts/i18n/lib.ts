// Translation pipeline helpers. A Slovenian Sanity document is flattened into a list
// of translatable "units" (plain strings, or the spans of one rich-text block), a
// translator returns the same units in English, and `applyTranslations` puts them
// back into a copy of the document. Structure, keys, images and references never
// pass through the translator, so they cannot be damaged.

export type Unit = { key: string } & ({ text: string } | { spans: string[] });
export type TranslatedUnit = Unit;

const STRING = "string" as const;
const STRINGS = "strings" as const;
const RICH = "rich" as const;
type Schema = typeof STRING | typeof STRINGS | typeof RICH | Schema[] | { [field: string]: Schema };

const RECOMMENDED: Schema = [{ name: STRING, note: STRING, merchant: STRING }];

// What gets translated, per document type. Everything else is copied untouched.
export const TRANSLATABLE: Record<string, { [field: string]: Schema }> = {
	recipe: {
		title: STRING,
		description: STRING,
		cuisine: STRING,
		tags: STRINGS,
		ingredientGroups: [
			{ groupName: STRING, items: [{ name: STRING, amount: STRING, unit: STRING }] },
		],
		stepGroups: [{ groupName: STRING, items: [{ instruction: STRING, tip: STRING }] }],
		content: RICH,
		recommendedProducts: RECOMMENDED,
	},
	travelEntry: {
		title: STRING,
		description: STRING,
		location: STRING,
		country: STRING,
		tags: STRINGS,
		content: RICH,
		recommendedProducts: RECOMMENDED,
	},
	blogPost: {
		title: STRING,
		description: STRING,
		category: STRING,
		tags: STRINGS,
		content: RICH,
	},
	homePage: { heroTitle: STRING, heroSubtitle: STRING },
	aboutPage: {
		title: STRING,
		sections: [{ heading: STRING, text: RICH }],
		bio: RICH,
		socialLinks: [{ platform: STRING }],
	},
};

// Commerce documents keep one document and carry the English texts in an `en` block.
export const OVERRIDE_FIELDS: Record<string, { [field: string]: Schema }> = {
	product: { title: STRING, description: STRING, longDescription: RICH, tags: STRINGS },
	course: { title: STRING, description: STRING, tags: STRINGS },
	lesson: { title: STRING, description: STRING, content: RICH },
};

// biome-ignore lint/suspicious/noExplicitAny: Sanity documents are loosely typed JSON
type Json = any;
type Visitor = (
	key: string,
	value: string | string[],
	set: (translated: string | string[]) => void,
) => void;

function isRecord(value: Json): value is Record<string, Json> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function walk(node: Json, schema: Schema, key: string, visit: Visitor, set: (v: Json) => void) {
	if (node === undefined || node === null) return;
	if (schema === STRING) {
		if (typeof node === "string" && node.trim()) visit(key, node, (t) => set(t as string));
		return;
	}
	if (schema === STRINGS) {
		if (!Array.isArray(node)) return;
		node.forEach((item, i) => {
			if (typeof item === "string" && item.trim()) {
				visit(`${key}.${i}`, item, (t) => {
					node[i] = t as string;
				});
			}
		});
		return;
	}
	if (schema === RICH) {
		if (!Array.isArray(node)) return;
		for (let i = 0; i < node.length; i++) walkRichBlock(node[i], `${key}.${i}`, visit);
		return;
	}
	if (Array.isArray(schema)) {
		if (!Array.isArray(node)) return;
		for (let i = 0; i < node.length; i++) {
			walk(node[i], schema[0] as Schema, `${key}.${i}`, visit, (v) => {
				node[i] = v;
			});
		}
		return;
	}
	if (isRecord(node)) {
		for (const [field, sub] of Object.entries(schema)) {
			walk(node[field], sub, key ? `${key}.${field}` : field, visit, (v) => {
				node[field] = v;
			});
		}
	}
}

function walkRichBlock(block: Json, key: string, visit: Visitor) {
	if (!isRecord(block)) return;
	if (block._type === "block" && Array.isArray(block.children)) {
		const spans = block.children.filter((c: Json) => isRecord(c) && c._type === "span");
		if (spans.some((s: Json) => typeof s.text === "string" && s.text.trim())) {
			visit(
				key,
				spans.map((s: Json) => String(s.text ?? "")),
				(translated) => {
					const list = translated as string[];
					spans.forEach((span: Json, i: number) => {
						span.text = list[i] ?? span.text;
					});
				},
			);
		}
		return;
	}
	if (block._type === "image") {
		for (const field of ["alt", "caption"]) {
			if (typeof block[field] === "string" && block[field].trim()) {
				visit(`${key}.${field}`, block[field], (t) => {
					block[field] = t as string;
				});
			}
		}
		return;
	}
	if (
		(block._type === "htmlEmbed" || block._type === "youtube") &&
		typeof block.title === "string" &&
		block.title.trim()
	) {
		visit(`${key}.title`, block.title, (t) => {
			block.title = t as string;
		});
	}
}

function schemaFor(type: string, override: boolean): { [field: string]: Schema } | undefined {
	return override ? OVERRIDE_FIELDS[type] : TRANSLATABLE[type];
}

/** The strings of `doc` that need translating. */
export function extractUnits(doc: Json, override = false): Unit[] {
	const schema = schemaFor(doc._type, override);
	if (!schema) return [];
	const units: Unit[] = [];
	const clone = structuredClone(doc);
	walk(
		clone,
		schema,
		"",
		(key, value) => {
			units.push(typeof value === "string" ? { key, text: value } : { key, spans: value });
		},
		() => undefined,
	);
	return units;
}

/** A copy of `doc` with the translated units put back in. Throws on a missing or mismatched unit. */
export function applyTranslations(doc: Json, translated: TranslatedUnit[], override = false): Json {
	const schema = schemaFor(doc._type, override);
	if (!schema) return structuredClone(doc);
	const byKey = new Map(translated.map((unit) => [unit.key, unit]));
	const clone = structuredClone(doc);
	const missing: string[] = [];
	walk(
		clone,
		schema,
		"",
		(key, value, set) => {
			const unit = byKey.get(key);
			if (!unit) {
				missing.push(key);
				return;
			}
			if (typeof value === "string") {
				if (!("text" in unit) || typeof unit.text !== "string")
					throw new Error(`Unit ${key}: expected text`);
				set(unit.text);
			} else {
				if (
					!("spans" in unit) ||
					!Array.isArray(unit.spans) ||
					unit.spans.length !== value.length
				) {
					throw new Error(`Unit ${key}: expected ${value.length} spans`);
				}
				set(unit.spans.map(String));
			}
		},
		() => undefined,
	);
	if (missing.length)
		throw new Error(
			`Missing translations for: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
		);
	return clone;
}

const SLOVENE_LETTERS = /[čšžČŠŽ]/;

/** Units whose "English" still looks Slovenian or came back unchanged: for review, not a hard error. */
export function suspiciousUnits(source: Unit[], translated: TranslatedUnit[]): string[] {
	const byKey = new Map(translated.map((unit) => [unit.key, unit]));
	const flagged: string[] = [];
	for (const unit of source) {
		const t = byKey.get(unit.key);
		if (!t) continue;
		const text = "text" in t ? t.text : t.spans.join("");
		const original = "text" in unit ? unit.text : unit.spans.join("");
		if (SLOVENE_LETTERS.test(text)) flagged.push(`${unit.key}: contains č/š/ž`);
		else if (text === original && original.length > 25) flagged.push(`${unit.key}: unchanged`);
	}
	return flagged;
}

export function slugifyEnglish(text: string): string {
	return text
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 96)
		.replace(/-$/, "");
}

const LABEL_KEY = /^(tags\.\d+|cuisine)$/;

/**
 * Tags and cuisines are filter labels, so the same Slovenian label must become the
 * same English label in every document. Several translators work in parallel, so this
 * picks the most common English version for each Slovenian label (ties: the shorter,
 * then alphabetical) and rewrites the other documents to match.
 */
export function canonicalizeLabels(
	documents: { source: Unit[]; translated: TranslatedUnit[] }[],
): Map<string, string> {
	const counts = new Map<string, Map<string, number>>();
	for (const { source, translated } of documents) {
		const byKey = new Map(translated.map((unit) => [unit.key, unit]));
		for (const unit of source) {
			const t = byKey.get(unit.key);
			if (!LABEL_KEY.test(unit.key) || !("text" in unit) || !t || !("text" in t)) continue;
			const variants = counts.get(unit.text) ?? new Map<string, number>();
			variants.set(t.text, (variants.get(t.text) ?? 0) + 1);
			counts.set(unit.text, variants);
		}
	}
	const canonical = new Map<string, string>();
	for (const [original, variants] of counts) {
		const best = [...variants].sort(
			([a, na], [b, nb]) => nb - na || a.length - b.length || a.localeCompare(b),
		)[0];
		if (best) canonical.set(original, best[0]);
	}
	return canonical;
}

export function applyCanonicalLabels(
	source: Unit[],
	translated: TranslatedUnit[],
	canonical: Map<string, string>,
): TranslatedUnit[] {
	const original = new Map(source.map((unit) => [unit.key, unit]));
	return translated.map((unit) => {
		const src = original.get(unit.key);
		if (!LABEL_KEY.test(unit.key) || !src || !("text" in src) || !("text" in unit)) return unit;
		const label = canonical.get(src.text);
		return label ? { key: unit.key, text: label } : unit;
	});
}
