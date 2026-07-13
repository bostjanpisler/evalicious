import { Hono } from "hono";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "../lib/auth.js";
import { db } from "../lib/db.js";
import { isFreePublishedEbook } from "../lib/product-access.js";
import { getSignedDownloadUrl } from "../lib/r2.js";

export const downloadHandler = new Hono();

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

downloadHandler.get("/:orderId", async (c) => {
	// Authenticate user
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
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
	const pdfResponse = await fetch(fileUrl);
	if (!pdfResponse.ok) {
		return c.json({ error: "Failed to fetch file" }, 502);
	}

	const pdfBytes = await pdfResponse.arrayBuffer();

	// Watermark the PDF
	const pdfDoc = await PDFDocument.load(pdfBytes);
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
