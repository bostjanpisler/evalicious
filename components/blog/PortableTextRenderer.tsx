"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

const components: PortableTextComponents = {
	block: {
		h2: ({ children, value }) => (
			<h2 id={value._key} className="mt-10 mb-4 scroll-mt-24 font-serif text-3xl font-bold">
				{children}
			</h2>
		),
		h3: ({ children, value }) => (
			<h3 id={value._key} className="mt-8 mb-3 scroll-mt-24 font-serif text-2xl font-semibold">
				{children}
			</h3>
		),
		h4: ({ children, value }) => (
			<h4 id={value._key} className="mt-6 mb-2 scroll-mt-24 font-serif text-xl font-semibold">
				{children}
			</h4>
		),
		normal: ({ children }) => (
			<p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
		),
		blockquote: ({ children }) => (
			<blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
				{children}
			</blockquote>
		),
	},
	list: {
		bullet: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
		number: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
	},
	listItem: {
		bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
		number: ({ children }) => <li className="leading-relaxed">{children}</li>,
	},
	marks: {
		strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
		em: ({ children }) => <em>{children}</em>,
		link: ({ children, value }) => (
			<a
				href={value?.href}
				className="text-primary underline underline-offset-4 hover:text-primary/80"
				target={value?.href?.startsWith("http") ? "_blank" : undefined}
				rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
			>
				{children}
			</a>
		),
	},
	types: {
		image: ({ value }) => (
			<figure className="my-8">
				<OptimizedImage
					image={value}
					alt={value.alt ?? ""}
					width={800}
					className="w-full rounded-lg"
				/>
				{value.caption && (
					<figcaption className="mt-2 text-center text-sm text-muted-foreground">
						{value.caption}
					</figcaption>
				)}
			</figure>
		),
	},
};

// biome-ignore lint/suspicious/noExplicitAny: Portable Text value type is complex
export function PortableTextRenderer({ value }: { value: any }) {
	if (!value) return null;
	return (
		<div className="prose-custom">
			<PortableText value={value} components={components} />
		</div>
	);
}

// Extract headings from Portable Text content for TOC
// biome-ignore lint/suspicious/noExplicitAny: Portable Text block type
export function extractHeadings(blocks: any[]): { key: string; text: string; level: number }[] {
	if (!blocks) return [];
	return blocks
		.filter(
			(block) =>
				block._type === "block" && ["h2", "h3", "h4"].includes(block.style),
		)
		.map((block) => ({
			key: block._key,
			text: block.children?.map((c: { text: string }) => c.text).join("") ?? "",
			level: Number(block.style.replace("h", "")),
		}));
}
