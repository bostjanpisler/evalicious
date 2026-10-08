// English translation pipeline for the Sanity content.
//
//   bun scripts/i18n/pipeline.ts extract [--force]   Slovenian docs -> .i18n-work/todo/batch-*.json
//   (a translator fills .i18n-work/done/batch-*.json with the same units in English)
//   bun scripts/i18n/pipeline.ts build               todo + done -> .i18n-work/build/mutations.json (dry run, validates)
//   bun scripts/i18n/pipeline.ts apply --yes         mutations.json -> Sanity (needs SANITY_WRITE_TOKEN)
//
// Read access uses the site's SANITY_API_TOKEN; writing needs an Editor token.
import { createClient } from "@sanity/client";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	applyCanonicalLabels,
	applyTranslations,
	canonicalizeLabels,
	extractUnits,
	OVERRIDE_FIELDS,
	slugifyEnglish,
	suspiciousUnits,
	TRANSLATABLE,
	type TranslatedUnit,
	type Unit,
} from "./lib";

const ROOT = join(import.meta.dirname, "../../.i18n-work");
const DIRS = {
	source: join(ROOT, "source"),
	todo: join(ROOT, "todo"),
	done: join(ROOT, "done"),
	build: join(ROOT, "build"),
};
const BATCH_CHARS = 30_000;
const DOC_LEVEL = Object.keys(TRANSLATABLE);
const OVERRIDE = Object.keys(OVERRIDE_FIELDS);

// biome-ignore lint/suspicious/noExplicitAny: Sanity documents are loosely typed JSON
type Doc = any;
type TodoDoc = { id: string; type: string; title: string; override: boolean; units: Unit[] };
type DoneDoc = { id: string; units: TranslatedUnit[] };

function client(token?: string) {
	return createClient({
		projectId: process.env.SANITY_PROJECT_ID ?? "o1l09q7i",
		dataset: process.env.SANITY_DATASET ?? "production",
		apiVersion: "2024-01-01",
		useCdn: false,
		token,
	});
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function size(units: Unit[]): number {
	return units.reduce(
		(sum, unit) => sum + ("text" in unit ? unit.text.length : unit.spans.join("").length) + 40,
		0,
	);
}

async function extract(force: boolean) {
	const sanity = client(process.env.SANITY_API_TOKEN);
	const docs: Doc[] = await sanity.fetch(
		`*[_type in $types && !(_id in path("drafts.**")) && coalesce(language, "sl") == "sl"]`,
		{ types: [...DOC_LEVEL, ...OVERRIDE] },
	);
	const translatedIds = new Set<string>(
		await sanity.fetch(`*[defined(translationOf._ref)].translationOf._ref`),
	);
	for (const dir of Object.values(DIRS)) mkdirSync(dir, { recursive: true });

	const todo: TodoDoc[] = [];
	for (const doc of docs) {
		const override = OVERRIDE.includes(doc._type);
		if (!force && (override ? doc.en?.title : translatedIds.has(doc._id))) continue;
		const units = extractUnits(doc, override);
		if (units.length === 0) continue;
		writeFileSync(join(DIRS.source, `${doc._id}.json`), JSON.stringify(doc, null, 2));
		todo.push({
			id: doc._id,
			type: doc._type,
			title: doc.title ?? doc.heroTitle ?? doc._type,
			override,
			units,
		});
	}

	// Batches of similar size; big documents (travel guides) get a batch of their own.
	const batches: TodoDoc[][] = [];
	let current: TodoDoc[] = [];
	let chars = 0;
	for (const item of todo.sort((a, b) => a.type.localeCompare(b.type))) {
		const itemSize = size(item.units);
		if (current.length && chars + itemSize > BATCH_CHARS) {
			batches.push(current);
			current = [];
			chars = 0;
		}
		current.push(item);
		chars += itemSize;
	}
	if (current.length) batches.push(current);
	batches.forEach((batch, i) => {
		writeFileSync(
			join(DIRS.todo, `batch-${String(i + 1).padStart(2, "0")}.json`),
			JSON.stringify(batch, null, 1),
		);
	});
	console.log(
		`${todo.length} documents (${docs.length} found) in ${batches.length} batches -> ${DIRS.todo}`,
	);
}

function loadDone(): Map<string, DoneDoc> {
	const done = new Map<string, DoneDoc>();
	let files: string[] = [];
	try {
		files = readdirSync(DIRS.done).filter((f) => f.endsWith(".json"));
	} catch {}
	for (const file of files) {
		for (const entry of readJson<DoneDoc[]>(join(DIRS.done, file))) done.set(entry.id, entry);
	}
	return done;
}

type Mutation = { createOrReplace: Doc } | { patch: { id: string; set: Doc } };

function build(): { mutations: Mutation[]; problems: string[]; review: string[] } {
	const done = loadDone();
	const todoFiles = readdirSync(DIRS.todo).filter((f) => f.endsWith(".json"));
	const mutations: Mutation[] = [];
	const problems: string[] = [];
	const review: string[] = [];
	const slugs = new Set<string>();

	// Same Slovenian tag/cuisine -> same English label everywhere.
	const all = todoFiles.flatMap((file) => readJson<TodoDoc[]>(join(DIRS.todo, file)));
	const canonical = canonicalizeLabels(
		all.flatMap((item) => {
			const entry = done.get(item.id);
			return entry ? [{ source: item.units, translated: entry.units }] : [];
		}),
	);

	for (const file of todoFiles) {
		for (const item of readJson<TodoDoc[]>(join(DIRS.todo, file))) {
			const translated = done.get(item.id);
			if (!translated) {
				problems.push(`${item.id} (${item.title}): no translation yet`);
				continue;
			}
			const source = readJson<Doc>(join(DIRS.source, `${item.id}.json`));
			let result: Doc;
			try {
				result = applyTranslations(
					source,
					applyCanonicalLabels(item.units, translated.units, canonical),
					item.override,
				);
			} catch (error) {
				problems.push(
					`${item.id} (${item.title}): ${error instanceof Error ? error.message : error}`,
				);
				continue;
			}
			for (const flag of suspiciousUnits(item.units, translated.units))
				review.push(`${item.id} (${item.title}) ${flag}`);

			if (item.override) {
				const set: Doc = {};
				for (const field of Object.keys(OVERRIDE_FIELDS[item.type] ?? {})) {
					if (result[field] !== undefined) set[field] = result[field];
				}
				mutations.push({ patch: { id: item.id, set: { en: set } } });
				continue;
			}

			const { _rev, _createdAt, _updatedAt, ...rest } = result;
			const doc: Doc = {
				...rest,
				_id: `${item.id}-en`,
				language: "en",
				translationOf: { _type: "reference", _ref: item.id },
			};
			if (doc.slug) {
				let slug = slugifyEnglish(doc.title ?? item.id) || item.id;
				const base = slug;
				for (let n = 2; slugs.has(`${item.type}:${slug}`); n++) slug = `${base}-${n}`;
				slugs.add(`${item.type}:${slug}`);
				doc.slug = { _type: "slug", current: slug };
			}
			mutations.push({ createOrReplace: doc });
		}
	}
	return { mutations, problems, review };
}

async function apply(confirmed: boolean) {
	const token = process.env.SANITY_WRITE_TOKEN;
	const path = join(DIRS.build, "mutations.json");
	const mutations = readJson<Mutation[]>(path);
	console.log(`${mutations.length} mutations from ${path}`);
	if (!confirmed)
		return console.log("Dry run. Re-run with --yes and SANITY_WRITE_TOKEN to write to Sanity.");
	if (!token) throw new Error("SANITY_WRITE_TOKEN is not set");
	const sanity = client(token);
	for (let i = 0; i < mutations.length; i += 20) {
		const tx = sanity.transaction();
		for (const m of mutations.slice(i, i + 20)) {
			if ("createOrReplace" in m) tx.createOrReplace(m.createOrReplace);
			else tx.patch(m.patch.id, (p) => p.set(m.patch.set));
		}
		await tx.commit();
		console.log(`  wrote ${Math.min(i + 20, mutations.length)}/${mutations.length}`);
	}
}

/** Validates one translated batch file against its todo file. Returns a list of problems. */
function check(batch: string): string[] {
	const name = batch.replace(/^.*\//, "").replace(/\.json$/, "");
	const todo = readJson<TodoDoc[]>(join(DIRS.todo, `${name}.json`));
	let done: DoneDoc[];
	try {
		done = readJson<DoneDoc[]>(join(DIRS.done, `${name}.json`));
	} catch (error) {
		return [`cannot read done/${name}.json: ${error instanceof Error ? error.message : error}`];
	}
	const problems: string[] = [];
	const byId = new Map(done.map((entry) => [entry.id, entry]));
	for (const item of todo) {
		const entry = byId.get(item.id);
		if (!entry) {
			problems.push(`${item.id} (${item.title}) missing`);
			continue;
		}
		const keys = new Map(entry.units.map((unit) => [unit.key, unit]));
		for (const unit of item.units) {
			const t = keys.get(unit.key);
			if (!t) problems.push(`${item.id} ${unit.key} missing`);
			else if ("spans" in unit && !("spans" in t && t.spans.length === unit.spans.length))
				problems.push(`${item.id} ${unit.key} span count`);
			else if ("text" in unit && !("text" in t && typeof t.text === "string"))
				problems.push(`${item.id} ${unit.key} not text`);
		}
		for (const flag of suspiciousUnits(item.units, entry.units))
			problems.push(`${item.id} (${item.title}) ${flag}`);
	}
	return problems;
}

const [command, ...flags] = process.argv.slice(2);
if (command === "extract") await extract(flags.includes("--force"));
else if (command === "build") {
	const { mutations, problems, review } = build();
	mkdirSync(DIRS.build, { recursive: true });
	writeFileSync(join(DIRS.build, "mutations.json"), JSON.stringify(mutations, null, 1));
	writeFileSync(join(DIRS.build, "review.txt"), review.join("\n"));
	console.log(
		`${mutations.length} mutations built, ${problems.length} problems, ${review.length} to review`,
	);
	for (const problem of problems.slice(0, 20)) console.log(`  PROBLEM ${problem}`);
	if (review.length) console.log(`  review list: ${join(DIRS.build, "review.txt")}`);
	if (problems.length) process.exitCode = 1;
} else if (command === "check") {
	const problems = check(flags[0] ?? "");
	console.log(problems.length ? problems.join("\n") : "OK");
	if (problems.length) process.exitCode = 1;
} else if (command === "apply") await apply(flags.includes("--yes"));
else console.log("Usage: pipeline.ts extract [--force] | check <batch-name> | build | apply --yes");
