import { describe, expect, test } from "bun:test";
import { en, sl } from "./messages";

type Leaf = string | ((n: number) => string);
type Tree = { [key: string]: Leaf | Tree };

function leaves(tree: Tree, prefix = ""): [string, Leaf][] {
	return Object.entries(tree).flatMap(([key, value]) =>
		typeof value === "string" || typeof value === "function"
			? [[`${prefix}${key}`, value] as [string, Leaf]]
			: leaves(value, `${prefix}${key}.`),
	);
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const slLeaves = new Map(leaves(sl as Tree));
const enLeaves = new Map(leaves(en as Tree));

describe("messages", () => {
	test("English has exactly the Slovenian keys", () => {
		expect([...enLeaves.keys()].sort()).toEqual([...slLeaves.keys()].sort());
	});

	test("no message is empty", () => {
		for (const [key, value] of [...slLeaves, ...enLeaves]) {
			if (typeof value === "string") expect(value.trim().length > 0, key).toBe(true);
		}
	});

	test("English uses the same placeholders as Slovenian", () => {
		for (const [key, slValue] of slLeaves) {
			const enValue = enLeaves.get(key);
			if (typeof slValue === "string" && typeof enValue === "string") {
				expect(placeholders(enValue), key).toEqual(placeholders(slValue));
			}
			if (typeof slValue === "function") expect(typeof enValue, key).toBe("function");
		}
	});

	test("plural functions return text for typical counts", () => {
		for (const [key, value] of enLeaves) {
			if (typeof value === "function") {
				for (const n of [0, 1, 2, 5]) expect(value(n).length > 0, `${key}(${n})`).toBe(true);
			}
		}
	});

	test("English text contains no Slovenian letters", () => {
		for (const [key, value] of enLeaves) {
			if (typeof value === "string") expect(/[čšžČŠŽ]/.test(value), key).toBe(false);
		}
	});
});
