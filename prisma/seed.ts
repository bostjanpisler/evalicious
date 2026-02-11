import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@sanity/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import "dotenv/config";

// ── Prisma ──────────────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// ── Sanity (write client) ───────────────────────────────────────────────────

const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID!,
	dataset: process.env.SANITY_DATASET ?? "production",
	apiVersion: "2024-01-01",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

// ── IDs (deterministic so the script is idempotent) ─────────────────────────

const LESSON_1_ID = "seed-lesson-uvod-v-pecenje";
const LESSON_2_ID = "seed-lesson-kvasni-kruh";
const LESSON_3_ID = "seed-lesson-focaccia";
const COURSE_ID = "seed-course-pecenje-kruha";
const EBOOK_PRODUCT_ID = "seed-product-ebook-recepti";
const ECOURSE_PRODUCT_ID = "seed-product-ecourse-pecenje";

// ── Generate a test PDF ──────────────────────────────────────────────────────

async function generateTestPdf(): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

	const recipes = [
		"Bananin kruh",
		"Limonina torta",
		"Cokoladni mousse",
		"Palacinke z Nutello",
		"Cezarjeva solata",
	];

	// Title page
	const titlePage = doc.addPage([595, 842]);
	titlePage.drawText("30 najboljsih receptov", {
		x: 100,
		y: 500,
		size: 32,
		font: boldFont,
		color: rgb(0.8, 0.5, 0.1),
	});
	titlePage.drawText("Eva-Licious.com", {
		x: 100,
		y: 460,
		size: 16,
		font,
		color: rgb(0.4, 0.4, 0.4),
	});
	titlePage.drawText("Testna e-knjiga za razvoj", {
		x: 100,
		y: 420,
		size: 12,
		font,
		color: rgb(0.6, 0.6, 0.6),
	});

	// A few sample recipe pages
	for (const recipe of recipes) {
		const page = doc.addPage([595, 842]);
		page.drawText(recipe, {
			x: 50,
			y: 780,
			size: 24,
			font: boldFont,
			color: rgb(0.2, 0.2, 0.2),
		});
		page.drawText("Sestavine:", {
			x: 50,
			y: 730,
			size: 14,
			font: boldFont,
			color: rgb(0.3, 0.3, 0.3),
		});
		page.drawText("- 200g moke\n- 100g masla\n- 2 jajci\n- 150g sladkorja", {
			x: 50,
			y: 710,
			size: 12,
			font,
			color: rgb(0.4, 0.4, 0.4),
			lineHeight: 18,
		});
		page.drawText("Postopek:", {
			x: 50,
			y: 620,
			size: 14,
			font: boldFont,
			color: rgb(0.3, 0.3, 0.3),
		});
		page.drawText(
			"1. Zmesaj suhe sestavine.\n2. Dodaj jajca in maslo.\n3. Peci 30 minut na 180 C.",
			{
				x: 50,
				y: 600,
				size: 12,
				font,
				color: rgb(0.4, 0.4, 0.4),
				lineHeight: 18,
			},
		);
	}

	return doc.save();
}

// ── Sanity seed data ────────────────────────────────────────────────────────

async function seedSanity() {
	console.log("Seeding Sanity...");

	// Lessons
	await sanity.createOrReplace({
		_id: LESSON_1_ID,
		_type: "lesson",
		title: "Uvod v pečenje kruha",
		slug: { _type: "slug", current: "uvod-v-pecenje" },
		description:
			"Spoznaj osnove pečenja kruha — od izbire moke do gnetenja testa.",
		sortOrder: 1,
		durationMinutes: 15,
		isFree: true,
	});

	await sanity.createOrReplace({
		_id: LESSON_2_ID,
		_type: "lesson",
		title: "Kvasni kruh",
		slug: { _type: "slug", current: "kvasni-kruh" },
		description:
			"Peci preprost kvasni kruh s hrustljavo skorjo in mehko sredico.",
		sortOrder: 2,
		durationMinutes: 25,
		isFree: false,
	});

	await sanity.createOrReplace({
		_id: LESSON_3_ID,
		_type: "lesson",
		title: "Focaccia z rožmarinom",
		slug: { _type: "slug", current: "focaccia" },
		description:
			"Italijanska focaccia z oljčnim oljem in svežim rožmarinom.",
		sortOrder: 3,
		durationMinutes: 30,
		isFree: false,
	});

	// Course
	await sanity.createOrReplace({
		_id: COURSE_ID,
		_type: "course",
		title: "Delavnica pečenja kruha",
		slug: { _type: "slug", current: "pecenje-kruha" },
		description:
			"Nauči se peči kruh od začetka — od preprostega kvasnega kruha do focaccie. 3 video lekcije za začetnike.",
		steps: [
			{ _type: "reference", _ref: LESSON_1_ID, _key: "step1" },
			{ _type: "reference", _ref: LESSON_2_ID, _key: "step2" },
			{ _type: "reference", _ref: LESSON_3_ID, _key: "step3" },
		],
		tags: ["kruh", "pečenje", "začetniki"],
		published: true,
		publishedAt: new Date().toISOString(),
	});

	// Generate and upload test PDF
	console.log("  Generating test PDF...");
	const pdfBytes = await generateTestPdf();
	const pdfAsset = await sanity.assets.upload("file", Buffer.from(pdfBytes), {
		filename: "30-najboljsih-receptov.pdf",
		contentType: "application/pdf",
	});
	console.log(`  PDF uploaded: ${pdfAsset._id}`);

	// Ebook product
	await sanity.createOrReplace({
		_id: EBOOK_PRODUCT_ID,
		_type: "product",
		title: "E-knjiga: 30 najboljših receptov",
		slug: { _type: "slug", current: "30-najboljsih-receptov" },
		description:
			"Zbirka 30 skrbno izbranih receptov — od zajtrka do sladice. PDF format, takojšnji prenos.",
		type: "ebook",
		priceInCents: 1490,
		currency: "EUR",
		featured: true,
		published: true,
		tags: ["recepti", "e-knjiga", "pdf"],
		digitalFile: {
			_type: "file",
			asset: {
				_type: "reference",
				_ref: pdfAsset._id,
			},
		},
		longDescription: [
			{
				_type: "block",
				_key: "desc1",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "s1",
						text: "Kaj dobiš?",
					},
				],
			},
			{
				_type: "block",
				_key: "desc2",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "s2",
						text: "30 receptov razdeljenih v 5 poglavij: zajtrk, kosilo, večerja, prigrizki in sladice. Vsak recept vključuje natančna navodila, seznam sestavin in prehranske podatke.",
					},
				],
			},
			{
				_type: "block",
				_key: "desc3",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "s3",
						text: "E-knjiga je v PDF formatu in jo lahko prebereš na telefonu, tablici ali računalniku. Po nakupu jo takoj preneseš.",
					},
				],
			},
		],
	});

	// Ecourse product
	await sanity.createOrReplace({
		_id: ECOURSE_PRODUCT_ID,
		_type: "product",
		title: "Video delavnica: Pečenje kruha",
		slug: { _type: "slug", current: "tecaj-pecenje-kruha" },
		description:
			"3 video lekcije za začetnike — od osnovnega kvasnega kruha do focaccie z rožmarinom.",
		type: "ecourse",
		priceInCents: 2990,
		currency: "EUR",
		featured: true,
		published: true,
		tags: ["tečaj", "video", "kruh"],
		course: {
			_type: "reference",
			_ref: COURSE_ID,
		},
		longDescription: [
			{
				_type: "block",
				_key: "desc1",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "s1",
						text: "Kaj se boš naučil/a?",
					},
				],
			},
			{
				_type: "block",
				_key: "desc2",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "s2",
						text: "V treh video lekcijah te popeljem skozi celoten proces pečenja kruha — od izbire moke in priprave kvasa do oblikovanja in pečenja. Na koncu boš znal/a speči kvasni kruh in focaccio.",
					},
				],
			},
		],
	});

	console.log("Sanity seeded.");
}

// ── Prisma seed data ────────────────────────────────────────────────────────

async function seedPrisma() {
	console.log("Seeding Prisma...");

	// Ebook product
	await db.product.upsert({
		where: { sanityId: EBOOK_PRODUCT_ID },
		update: {
			slug: "30-najboljsih-receptov",
			type: "ebook",
			priceInCents: 1490,
			currency: "EUR",
		},
		create: {
			sanityId: EBOOK_PRODUCT_ID,
			slug: "30-najboljsih-receptov",
			type: "ebook",
			priceInCents: 1490,
			currency: "EUR",
			// Set these to your real Stripe IDs to test checkout:
			// stripePriceId: "price_xxx",
			// stripeProductId: "prod_xxx",
		},
	});

	// Ecourse product
	await db.product.upsert({
		where: { sanityId: ECOURSE_PRODUCT_ID },
		update: {
			slug: "tecaj-pecenje-kruha",
			type: "ecourse",
			priceInCents: 2990,
			currency: "EUR",
		},
		create: {
			sanityId: ECOURSE_PRODUCT_ID,
			slug: "tecaj-pecenje-kruha",
			type: "ecourse",
			priceInCents: 2990,
			currency: "EUR",
			// Set these to your real Stripe IDs to test checkout:
			// stripePriceId: "price_xxx",
			// stripeProductId: "prod_xxx",
		},
	});

	console.log("Prisma seeded.");

	// Optionally create a test order for the first user (to test "already purchased" state)
	const firstUser = await db.user.findFirst();
	if (firstUser) {
		console.log(`Found user: ${firstUser.email} — creating test order...`);

		const ebookProduct = await db.product.findUnique({
			where: { slug: "30-najboljsih-receptov" },
		});

		if (ebookProduct) {
			const existingOrder = await db.order.findFirst({
				where: {
					userId: firstUser.id,
					items: { some: { productId: ebookProduct.id } },
				},
			});

			if (!existingOrder) {
				await db.order.create({
					data: {
						userId: firstUser.id,
						status: "completed",
						totalInCents: 1490,
						currency: "EUR",
						email: firstUser.email,
						stripeSessionId: `seed_session_${Date.now()}`,
						stripePaymentIntentId: `seed_pi_${Date.now()}`,
						items: {
							create: {
								productId: ebookProduct.id,
								priceInCents: 1490,
							},
						},
					},
				});
				console.log("Test ebook order created.");
			} else {
				console.log("Test ebook order already exists, skipping.");
			}
		}

		// Grant course access for the ecourse
		const ecourseProduct = await db.product.findUnique({
			where: { slug: "tecaj-pecenje-kruha" },
		});

		if (ecourseProduct) {
			const existingCourseOrder = await db.order.findFirst({
				where: {
					userId: firstUser.id,
					items: { some: { productId: ecourseProduct.id } },
				},
			});

			if (!existingCourseOrder) {
				await db.order.create({
					data: {
						userId: firstUser.id,
						status: "completed",
						totalInCents: 2990,
						currency: "EUR",
						email: firstUser.email,
						stripeSessionId: `seed_session_course_${Date.now()}`,
						stripePaymentIntentId: `seed_pi_course_${Date.now()}`,
						items: {
							create: {
								productId: ecourseProduct.id,
								priceInCents: 2990,
							},
						},
					},
				});
				console.log("Test ecourse order created.");
			} else {
				console.log("Test ecourse order already exists, skipping.");
			}

			// Grant CourseAccess
			await db.courseAccess
				.upsert({
					where: {
						userId_courseId: {
							userId: firstUser.id,
							courseId: COURSE_ID,
						},
					},
					update: {},
					create: {
						userId: firstUser.id,
						courseId: COURSE_ID,
					},
				})
				.then(() => console.log("CourseAccess granted."))
				.catch(() => console.log("CourseAccess already exists."));
		}
	} else {
		console.log(
			"No user found — skipping test orders. Register a user first, then re-run the seed.",
		);
	}
}

// ── Run ─────────────────────────────────────────────────────────────────────

async function main() {
	await seedSanity();
	await seedPrisma();
	console.log("\nDone! You can now test:");
	console.log("  /shop                     — both products listed");
	console.log("  /shop/30-najboljsih-receptov  — ebook detail");
	console.log("  /shop/tecaj-pecenje-kruha     — ecourse detail (with course info)");
	console.log("  /dashboard/my-orders          — test orders (if user exists)");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
