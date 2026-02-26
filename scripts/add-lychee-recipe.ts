import { createClient } from "@sanity/client";
import "dotenv/config";

const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID!,
	dataset: process.env.SANITY_DATASET ?? "production",
	apiVersion: "2024-01-01",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const RECIPE_ID = "recipe-licijev-ledeni-caj";

async function main() {
	console.log("Creating recipe: Ličijev ledeni čaj...");

	await sanity.createOrReplace({
		_id: RECIPE_ID,
		_type: "recipe",
		title: "Ličijev ledeni čaj",
		slug: { _type: "slug", current: "licijev-ledeni-caj" },
		description:
			"Osvežilen ledeni čaj z liči sadežem — sladek, eksotičen in narejen v manj kot 10 minutah. Popolna poletna pijača!",
		categories: ["drink"],
		cuisine: "Azijska",
		difficulty: "easy",
		prepTime: 10,
		cookTime: 0,
		servings: 2,
		glutenFree: true,
		sugarFree: true,
		oilFree: true,
		soyFree: true,
		nutFree: true,
		tags: ["liči", "ledeni čaj", "poletje", "osvežilno", "hitro", "veganski"],
		ingredientGroups: [
			{
				_key: "main",
				groupName: null,
				items: [
					{
						_key: "i1",
						name: "poljubnega čaja (ohlajenega)",
						amount: "300",
						unit: "ml",
						optional: false,
					},
					{
						_key: "i2",
						name: "ličija iz konzerve",
						amount: "100",
						unit: "g",
						optional: false,
					},
					{
						_key: "i3",
						name: "tekočine iz konzerve",
						amount: "50",
						unit: "ml",
						optional: false,
					},
					{
						_key: "i4",
						name: "limone ali limete (sok)",
						amount: "1/4",
						unit: "kos",
						optional: false,
					},
					{
						_key: "i5",
						name: "sladilo po želji",
						amount: "",
						unit: "",
						optional: true,
					},
					{
						_key: "i6",
						name: "led",
						amount: "",
						unit: "",
						optional: false,
					},
				],
			},
			{
				_key: "deco",
				groupName: "Za dekoracijo",
				items: [
					{
						_key: "d1",
						name: "ličija iz konzerve",
						amount: "2",
						unit: "kosa",
						optional: true,
					},
					{
						_key: "d2",
						name: "zamrznjene maline (zdrobljene)",
						amount: "",
						unit: "",
						optional: true,
					},
				],
			},
		],
		stepGroups: [
			{
				_key: "sg1",
				groupName: null,
				items: [
					{
						_key: "s1",
						instruction:
							"Čaj pripravimo po navodilih in ga pustimo, da se popolnoma ohladi. Lahko ga pripravimo dan prej in shranimo v hladilniku.",
						tip: "Odlično se obnese zeleni čaj ali jasminov čaj — oba lepo dopolnjujeta sladkobo ličija.",
					},
					{
						_key: "s2",
						instruction:
							"Ohlajeni čaj, ličije iz konzerve, tekočino iz konzerve in sok limone ali limete zblendamo do gladkega.",
						tip: null,
					},
					{
						_key: "s3",
						instruction:
							"Kozarce napolnimo z ledom in napitek precedimo skozi cedilo.",
						tip: "Precejanje poskrbi, da je napitek svilnato gladek brez koščkov.",
					},
					{
						_key: "s4",
						instruction:
							"Za dekoracijo na vrh kozarca dodamo po en ličij iz konzerve in posujemo z zdrobljenimi zamrznjenimi malinami.",
						tip: null,
					},
				],
			},
		],
		content: [
			{
				_type: "block",
				_key: "b1",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "sp1",
						text: "Eksotična svežina v kozarcu",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b2",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp2",
						text: "Vsakič, ko odprem konzervo ličijev, me odnese nekam daleč — v Tajsko, na tržnico polno barv in eksotičnih sadežev, ali pa preprosto na sončno teraso s kozarcem nečesa hladnega v roki. Liči je eden tistih sadežev, ki te že z vonjem prepriča, da bo dobro. In ko ga kombiniraš z ledenim čajem? Čista magija.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b3",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp3",
						text: "Ta recept je nastal čisto spontano — imela sem na polici konzervo ličijev, vrč ohlajenega čaja in željo po nečem osvežilnem. Po prvem požirku sem vedela, da moram ta recept deliti z vami.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b4",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "sp4",
						text: "Zakaj liči?",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b5",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp5",
						text: "Liči ni le okusno eksotično sadje — je tudi prava zakladnica hranil. Bogat je z vitaminom C, ki krepi imunski sistem in pomaga pri absorpciji železa. Poleg tega vsebuje antioksidante, ki ščitijo celice pred oksidativnim stresom, ter vlaknine, ki podpirajo zdravo prebavo.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b6",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp6",
						text: "V 100 g ličija je le približno 66 kalorij, kar ga naredi za lahek in osvežilen prigrizek — še posebej v kombinaciji z ledenim čajem, ki je praktično brezkalorična pijača. Če iščeš zdravo alternativo sladkim sokovom, je ta napitek popolna izbira.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b7",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "sp7",
						text: "Nasveti za najboljši rezultat",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b8",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp8",
						text: "Čaj izberi po svojem okusu — jasminov čaj ali zeleni čaj dopolnjujeta sladkobo ličija, medtem ko bo črni čaj dal napitku malo več telesa. Lahko uporabiš tudi beli čaj za nežnejšo aromo. Ključno je, da čaj pred uporabo dobro ohladiš, saj bo tako napitek res osvežilen.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "b9",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "sp9",
						text: "Ne zavrzi tekočine iz konzerve — ravno ta daje napitku tisto čudovito naravno sladkobo, zaradi katere sladilo sploh ni potrebno. In zamrznjene maline na vrhu? Niso le za oko — ko se počasi topijo, dodajo rahlo kislost, ki celoten napitek dvigne na novo raven.",
						marks: [],
					},
				],
			},
		],
		published: true,
		publishedAt: new Date().toISOString(),
	});

	console.log("Recipe created successfully!");
	console.log("URL: /recipes/licijev-ledeni-caj");
}

main().catch(console.error);
