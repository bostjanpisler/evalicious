import { DEFAULT_LOCALE, ENGLISH_ENABLED, isLocale, type Locale } from "@/lib/i18n/config";
import { sanityClient } from "./sanity.js";

/** Locale from a client-supplied value, honouring ENGLISH_ENABLED. */
export function requestLocale(value: unknown): Locale {
	return ENGLISH_ENABLED && isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Saved recipes and list items are stored under the Slovenian original's id (the
 * "root"), so a favourite follows the recipe into the other language.
 */
export async function recipeRootId(id: string): Promise<string> {
	const root = await sanityClient.fetch<string | null>(
		`*[_type == "recipe" && _id == $id][0].translationOf._ref`,
		{ id },
	);
	return root ?? id;
}

export type LocalizedRecipe = {
	_id: string;
	root: string;
	language: string;
	title: string;
	slug: string;
	coverImage?: unknown;
	categories?: string[];
	cuisine?: string;
	difficulty?: string;
	prepTime?: number;
	cookTime?: number;
};

type Group = { recipe: LocalizedRecipe; ids: string[] };

/** For each saved id (a root, or an older document id): the recipe in `locale` and all ids of the group. */
export async function resolveRecipes(ids: string[], locale: Locale): Promise<Map<string, Group>> {
	const resolved = new Map<string, Group>();
	if (ids.length === 0) return resolved;
	const docs =
		(await sanityClient.fetch<LocalizedRecipe[]>(
			`*[_type == "recipe" && published == true && (_id in $ids || translationOf._ref in $ids)]{
				_id,
				"root": coalesce(translationOf._ref, _id),
				"language": coalesce(language, "sl"),
				title, "slug": slug.current, coverImage, categories, cuisine,
				difficulty, prepTime, cookTime
			}`,
			{ ids },
		)) ?? [];

	const byRoot = new Map<string, LocalizedRecipe[]>();
	for (const doc of docs) byRoot.set(doc.root, [...(byRoot.get(doc.root) ?? []), doc]);
	for (const [root, group] of byRoot) {
		const pick =
			group.find((doc) => doc.language === locale) ??
			group.find((doc) => doc.language === DEFAULT_LOCALE) ??
			group[0];
		if (!pick) continue;
		const entry: Group = { recipe: pick, ids: group.map((doc) => doc._id) };
		resolved.set(root, entry);
		for (const doc of group) resolved.set(doc._id, entry);
	}
	return resolved;
}
