import { Hono } from "hono";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { translatorFor } from "@/lib/i18n/messages";
import { localizePath } from "@/lib/i18n/paths";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "../lib/auth.js";
import { db } from "../lib/db.js";
import {
	confirmLead,
	createFreeDownloadToken,
	createPasswordSetupToken,
	emailHasLogin,
	nameFromEmail,
	normalizeEmail,
	verifyFreeDownloadToken,
} from "../lib/free-download.js";
import {
	isHalConfigured,
	requestFreeDownloadEmail,
	syncFreeDownloadLeadToHal,
} from "../lib/hal.js";
import { requestLocale } from "../lib/recipe-i18n.js";
import {
	canAccessLesson,
	getFreePublishedEbook,
	isFreePublishedCourse,
} from "../lib/product-access.js";
import { deliveryConfigurationError } from "../lib/product-sellability.js";
import { getSignedDownloadUrl } from "../lib/r2.js";
import { sanityClient } from "../lib/sanity.js";

export const downloadHandler = new Hono();

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const PDF_FETCH_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 10;
const downloadWindows = new Map<string, { count: number; resetsAt: number }>();

const FREE_REQUEST_IP_LIMIT = 10;
const FREE_REQUEST_IP_WINDOW_MS = 10 * 60_000;
const FREE_REQUEST_EMAIL_LIMIT = 3;
const FREE_REQUEST_EMAIL_WINDOW_MS = 60 * 60_000;
const FREE_REQUEST_GLOBAL_LIMIT = 200;
const FREE_REQUEST_GLOBAL_WINDOW_MS = 10 * 60_000;
const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/i;

function isRateLimited(
	key: string,
	limit = RATE_LIMIT_REQUESTS,
	windowMs = RATE_LIMIT_WINDOW_MS,
): boolean {
	const now = Date.now();
	if (downloadWindows.size > 10_000) {
		for (const [entryKey, entry] of downloadWindows) {
			if (entry.resetsAt <= now) downloadWindows.delete(entryKey);
		}
	}
	const current = downloadWindows.get(key);
	if (!current || current.resetsAt <= now) {
		downloadWindows.set(key, { count: 1, resetsAt: now + windowMs });
		return false;
	}
	current.count += 1;
	return current.count > limit;
}

// Railway's edge sets X-Real-IP; the left-most X-Forwarded-For entry is client-controlled.
function clientIp(headers: Headers): string | null {
	return (
		headers.get("x-real-ip")?.trim() ||
		headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
		null
	);
}

async function findFreeEbook(productSlug: string, locale: Locale = DEFAULT_LOCALE) {
	if (!SLUG_PATTERN.test(productSlug)) return null;
	const product = await db.product.findUnique({ where: { slug: productSlug } });
	if (!product || !product.published || product.type !== "ebook" || product.priceInCents > 0) {
		return null;
	}
	const content = await getFreePublishedEbook(productSlug, locale);
	if (!content) return null;
	return { product, title: content.title };
}

async function fetchPdf(url: string, allowedHost?: string): Promise<Uint8Array> {
	const parsed = new URL(url);
	if (parsed.protocol !== "https:" || (allowedHost && parsed.hostname !== allowedHost)) {
		throw new Error("Invalid PDF source");
	}
	const response = await fetch(url, {
		signal: AbortSignal.timeout(PDF_FETCH_TIMEOUT_MS),
		redirect: allowedHost ? "error" : "follow",
	});
	if (!response.ok || !response.body) throw new Error("Failed to fetch PDF");
	const declaredSize = Number(response.headers.get("content-length") ?? 0);
	if (declaredSize > MAX_PDF_BYTES) throw new Error("PDF exceeds size limit");
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_PDF_BYTES) {
			await reader.cancel();
			throw new Error("PDF exceeds size limit");
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
		throw new Error("Downloaded file is not a PDF");
	}
	return bytes;
}

downloadHandler.post("/free/:productSlug", async (c) => {
	const { productSlug } = c.req.param();
	const body = (await c.req.json().catch(() => null)) as {
		locale?: unknown;
		email?: unknown;
		consent?: unknown;
	} | null;
	const email = normalizeEmail(body?.email);
	if (!email) return c.json({ error: "Invalid email" }, 400);
	if (body?.consent !== true) return c.json({ error: "Consent required" }, 400);
	const locale: Locale = requestLocale(body?.locale);

	const ip = clientIp(c.req.raw.headers);
	// Per-client limits run first so one client cannot use up the shared budget,
	// and before any database or CMS lookup.
	if (
		(ip && isRateLimited(`free-ip:${ip}`, FREE_REQUEST_IP_LIMIT, FREE_REQUEST_IP_WINDOW_MS)) ||
		isRateLimited(`free-email:${email}`, FREE_REQUEST_EMAIL_LIMIT, FREE_REQUEST_EMAIL_WINDOW_MS) ||
		isRateLimited("free-global", FREE_REQUEST_GLOBAL_LIMIT, FREE_REQUEST_GLOBAL_WINDOW_MS)
	) {
		return c.json({ error: "Too many download requests" }, 429);
	}

	const ebook = await findFreeEbook(productSlug, locale);
	if (!ebook) return c.json({ error: "File not found" }, 404);
	if (!ebook.product.r2FileKey || deliveryConfigurationError("ebook") || !isHalConfigured()) {
		return c.json({ error: "File not available" }, 404);
	}

	// Consent is only recorded here; the account and CRM entry are created when
	// the mailbox owner clicks a link in the email (double opt-in).
	const lead = await db.freeDownloadLead.create({
		data: {
			email,
			productId: ebook.product.id,
			// The exact wording the visitor agreed to, in their language.
			consentText: translatorFor(locale)("shop.freeDownload.consent"),
			locale,
			ipAddress: ip,
			userAgent: c.req.header("user-agent")?.slice(0, 500) ?? null,
		},
	});

	// Hal sends the branded email from its "Brezplačen prenos" workflow.
	try {
		await requestFreeDownloadEmail({
			leadId: lead.id,
			email,
			name: nameFromEmail(email),
			productSlug,
			productTitle: ebook.title,
			downloadToken: createFreeDownloadToken(lead.id),
			needsAccount: !(await emailHasLogin(email)),
			locale,
		});
	} catch (error) {
		console.error("Free download email request failed", error);
		// A timeout may still have sent the email, so keep that lead; otherwise
		// drop the consent record of an email that was never sent.
		if (!(error instanceof Error && error.name === "TimeoutError")) {
			await db.freeDownloadLead.delete({ where: { id: lead.id } }).catch(() => undefined);
		}
		return c.json({ error: "Email could not be sent" }, 502);
	}
	await db.freeDownloadLead
		.update({ where: { id: lead.id }, data: { emailSentAt: new Date() } })
		.catch(() => undefined);

	return c.json({ ok: true });
});

async function confirmFreeDownload(token: string | undefined) {
	const verified = token ? verifyFreeDownloadToken(token) : null;
	if (!verified) return { status: "invalid" as const };

	if (verified.expired) {
		// Read-only: an expired link must not create an account or confirm consent.
		const lead = await db.freeDownloadLead.findUnique({
			where: { id: verified.leadId },
			select: { locale: true, product: { select: { slug: true } } },
		});
		return lead
			? {
					status: "expired" as const,
					slug: lead.product.slug,
					locale: leadLocale(lead.locale),
				}
			: { status: "invalid" as const };
	}

	const confirmation = await confirmLead(verified.leadId);
	if (!confirmation) return { status: "invalid" as const };
	const { lead, user } = confirmation;
	const slug = lead.product.slug;
	const locale = leadLocale(lead.locale);

	// Retried on every open until it succeeds; the event key makes it idempotent.
	if (!lead.halSyncedAt && isHalConfigured()) {
		const ebook = await getFreePublishedEbook(slug, locale).catch(() => null);
		void syncFreeDownloadLeadToHal({
			leadId: lead.id,
			email: lead.email,
			name: user.name,
			userId: user.id,
			productSlug: slug,
			productTitle: ebook?.title ?? slug,
			consentedAt: lead.consentedAt,
			locale,
		})
			.then(({ contactId }) =>
				db.freeDownloadLead.update({
					where: { id: lead.id },
					data: { halContactId: contactId, halSyncedAt: new Date(), halError: null },
				}),
			)
			.catch((error: unknown) => {
				console.error("Hal lead sync failed", error);
				return db.freeDownloadLead
					.update({
						where: { id: lead.id },
						data: {
							halError: String(error instanceof Error ? error.message : error).slice(0, 500),
						},
					})
					.catch(() => undefined);
			});
	}

	return { status: "ok" as const, slug, user, locale };
}

function leadLocale(value: string): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

function expiredRedirect(result: { status: string; slug?: string; locale?: Locale }): string {
	const locale = result.locale ?? DEFAULT_LOCALE;
	return localizePath(
		result.slug ? `/shop/${encodeURIComponent(result.slug)}?download=expired` : "/shop",
		locale,
	);
}

// "Nastavi geslo" link in the email. Opening it also confirms the lead.
downloadHandler.get("/a", async (c) => {
	const result = await confirmFreeDownload(c.req.query("token"));
	c.header("Cache-Control", "private, no-store");
	if (result.status !== "ok") return c.redirect(expiredRedirect(result));
	if (!result.user.needsPassword) return c.redirect(localizePath("/login", result.locale));
	// Fragment keeps the token out of server logs and analytics page URLs.
	const setup = await createPasswordSetupToken(result.user.id);
	return c.redirect(
		`${localizePath("/reset-password", result.locale)}#token=${encodeURIComponent(setup)}`,
	);
});

// "Prenesi PDF" link in the email.
downloadHandler.get("/f", async (c) => {
	const result = await confirmFreeDownload(c.req.query("token"));
	c.header("Cache-Control", "private, no-store");
	if (result.status !== "ok") return c.redirect(expiredRedirect(result));

	const ebook = await findFreeEbook(result.slug);
	if (!ebook) return c.json({ error: "File not found" }, 404);
	if (!ebook.product.r2FileKey) return c.json({ error: "File not available" }, 404);

	return c.redirect(await getSignedDownloadUrl(ebook.product.r2FileKey, 300));
});

downloadHandler.get("/course/:courseSlug/:lessonSlug", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) return c.json({ error: "Unauthorized" }, 401);
	if (isRateLimited(`course:${session.user.id}`)) {
		return c.json({ error: "Too many download requests" }, 429);
	}
	const { courseSlug, lessonSlug } = c.req.param();
	if (!SLUG_PATTERN.test(courseSlug) || !SLUG_PATTERN.test(lessonSlug)) {
		return c.json({ error: "File not found" }, 404);
	}
	const course = await sanityClient.fetch<{
		_id: string;
		step?: { _id: string; isFree?: boolean; pdfUrl?: string };
	}>(
		`*[_type == "course" && published == true && slug.current == $courseSlug][0]{
			_id,
			"step": steps[]->[slug.current == $lessonSlug][0]{ _id, isFree, "pdfUrl": pdfFile.asset->url }
		}`,
		{ courseSlug, lessonSlug },
	);
	if (!course?.step?.pdfUrl) return c.json({ error: "File not found" }, 404);
	const access = await db.courseAccess.findUnique({
		where: { userId_courseId: { userId: session.user.id, courseId: course._id } },
	});
	const courseIsFree = access ? false : await isFreePublishedCourse(course._id);
	if (
		!canAccessLesson({
			lessonIsFree: course.step.isFree === true,
			hasCourseAccess: !!access,
			courseIsFree,
		})
	) {
		return c.json({ error: "File not found" }, 404);
	}
	try {
		const pdfBytes = await fetchPdf(course.step.pdfUrl, "cdn.sanity.io");
		return new Response(new Uint8Array(pdfBytes).buffer as ArrayBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${lessonSlug}.pdf"`,
				"Cache-Control": "private, no-store",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch {
		return c.json({ error: "File temporarily unavailable" }, 502);
	}
});

downloadHandler.get("/:orderId", async (c) => {
	// Authenticate user
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	if (isRateLimited(`order:${session.user.id}`)) {
		return c.json({ error: "Too many download requests" }, 429);
	}

	const { orderId } = c.req.param();

	// Verify user owns this order
	const order = await db.order.findFirst({
		where: {
			id: orderId,
			userId: session.user.id,
			status: "completed",
		},
		include: {
			items: {
				include: { product: true },
			},
		},
	});

	if (!order) {
		return c.json({ error: "Order not found" }, 404);
	}

	// Find the ebook product in this order
	const ebookItem = order.items.find((item) => item.product.type === "ebook");
	if (!ebookItem) {
		return c.json({ error: "No ebook in this order" }, 400);
	}

	if (!ebookItem.product.r2FileKey) {
		return c.json({ error: "File not available" }, 404);
	}

	const fileUrl = await getSignedDownloadUrl(ebookItem.product.r2FileKey, 300);
	let pdfBytes: Uint8Array;
	try {
		pdfBytes = await fetchPdf(fileUrl, new URL(fileUrl).hostname);
	} catch {
		return c.json({ error: "Failed to fetch file" }, 502);
	}

	// Watermark the PDF
	let pdfDoc: PDFDocument;
	try {
		pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
	} catch {
		return c.json({ error: "Invalid PDF file" }, 502);
	}
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const watermarkText = `Purchased by: ${session.user.name} <${session.user.email}>`;
	const fontSize = 8;
	const pages = pdfDoc.getPages();

	for (const page of pages) {
		const { width } = page.getSize();
		const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
		page.drawText(watermarkText, {
			x: (width - textWidth) / 2,
			y: 15,
			size: fontSize,
			font,
			color: rgb(0.7, 0.7, 0.7),
		});
	}

	const watermarkedBytes = await pdfDoc.save();
	const fileName = `${ebookItem.product.slug.replace(/[^a-zA-Z0-9-_]/g, "-")}.pdf`;

	return new Response(new Uint8Array(watermarkedBytes).buffer as ArrayBuffer, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${fileName}"`,
			"Cache-Control": "private, no-cache",
		},
	});
});
