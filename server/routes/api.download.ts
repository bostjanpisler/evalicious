import { Hono } from "hono";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "../lib/auth.js";
import { db } from "../lib/db.js";
import {
	canAccessLesson,
	isFreePublishedCourse,
	isFreePublishedEbook,
} from "../lib/product-access.js";
import { getSignedDownloadUrl } from "../lib/r2.js";
import { sanityClient } from "../lib/sanity.js";

export const downloadHandler = new Hono();

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const PDF_FETCH_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 10;
const downloadWindows = new Map<string, { count: number; resetsAt: number }>();

function isRateLimited(key: string): boolean {
	const now = Date.now();
	const current = downloadWindows.get(key);
	if (!current || current.resetsAt <= now) {
		downloadWindows.set(key, { count: 1, resetsAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}
	current.count += 1;
	return current.count > RATE_LIMIT_REQUESTS;
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

downloadHandler.get("/free/:productSlug", async (c) => {
	const { productSlug } = c.req.param();
	const product = await db.product.findUnique({ where: { slug: productSlug } });

	if (!product || !product.published || product.type !== "ebook" || product.priceInCents > 0) {
		return c.json({ error: "File not found" }, 404);
	}
	if (!(await isFreePublishedEbook(productSlug))) {
		return c.json({ error: "File not found" }, 404);
	}

	if (!product.r2FileKey) {
		return c.json({ error: "File not available" }, 404);
	}

	const fileUrl = await getSignedDownloadUrl(product.r2FileKey, 300);
	return c.redirect(fileUrl);
});

downloadHandler.get("/course/:courseSlug/:lessonSlug", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) return c.json({ error: "Unauthorized" }, 401);
	if (isRateLimited(`course:${session.user.id}`)) {
		return c.json({ error: "Too many download requests" }, 429);
	}
	const { courseSlug, lessonSlug } = c.req.param();
	if (!/^[a-z0-9-]{1,100}$/i.test(courseSlug) || !/^[a-z0-9-]{1,100}$/i.test(lessonSlug)) {
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
