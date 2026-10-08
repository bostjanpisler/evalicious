import { DEFAULT_LOCALE, type Locale } from "./config";

export type MessageValue = string | ((n: number) => string);
export type MessageTree = { [key: string]: MessageValue | MessageTree };

/** The same keys as `T`, with every leaf a string (or plural function). */
export type Shape<T> = T extends (n: number) => string
	? (n: number) => string
	: T extends string
		? string
		: { [K in keyof T]: Shape<T[K]> };

type Join<K extends string, P extends string> = `${K}.${P}`;
export type MessageKey<T> = T extends MessageValue
	? never
	: {
			[K in keyof T & string]: T[K] extends MessageValue ? K : Join<K, MessageKey<T[K]>>;
		}[keyof T & string];

export type Params = Record<string, string | number>;

function lookup(tree: MessageTree, key: string): MessageValue | undefined {
	let node: MessageValue | MessageTree | undefined = tree;
	for (const part of key.split(".")) {
		if (node === undefined || typeof node === "string" || typeof node === "function")
			return undefined;
		node = node[part];
	}
	return typeof node === "string" || typeof node === "function" ? node : undefined;
}

export function interpolate(template: string, params?: Params): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

/**
 * Builds `t(key, params)`. Plural messages are functions of a count: pass it as
 * `params.n`. A key missing from `messages` falls back to `fallback` (Slovenian),
 * then to the key itself, so an untranslated string never crashes a page.
 */
export function createTranslator<T extends MessageTree>(
	messages: MessageTree,
	fallback: MessageTree,
	_locale: Locale = DEFAULT_LOCALE,
) {
	return (key: MessageKey<T> | (string & {}), params?: Params): string => {
		const value = lookup(messages, key) ?? lookup(fallback, key);
		if (value === undefined) return key;
		if (typeof value === "function") return value(Number(params?.n ?? 0));
		return interpolate(value, params);
	};
}
