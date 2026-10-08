"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LEGAL } from "@/lib/legal";
import { useI18n } from "@/lib/i18n/react";

type Kind = "privacy" | "terms";

const EMAIL = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/;

function withEmailLinks(text: string) {
	let offset = 0;
	return text.split(EMAIL).map((part) => {
		const key = offset;
		offset += part.length;
		return EMAIL.test(part) ? (
			<a
				key={key}
				href={`mailto:${part}`}
				className="underline underline-offset-4 hover:text-primary"
			>
				{part}
			</a>
		) : (
			<span key={key}>{part}</span>
		);
	});
}

function Body({ text }: { text: string }) {
	return (
		<>
			{text.split("\n\n").map((block) => {
				const lines = block.split("\n");
				const bullets = lines.filter((line) => line.startsWith("• "));
				const intro = lines.filter((line) => !line.startsWith("• ")).join(" ");
				return (
					<div key={block} className="space-y-2">
						{intro && <p>{withEmailLinks(intro)}</p>}
						{bullets.length > 0 && (
							<ul className="ml-5 list-disc space-y-1">
								{bullets.map((line) => (
									<li key={line}>{withEmailLinks(line.slice(2))}</li>
								))}
							</ul>
						)}
					</div>
				);
			})}
		</>
	);
}

export function LegalDocument({ kind, sections }: { kind: Kind; sections: readonly string[] }) {
	const { t } = useI18n();
	const params = { name: LEGAL.name, address: LEGAL.address, email: LEGAL.email };
	const key = (rest: string) => `legal.${kind}.${rest}` as Parameters<typeof t>[0];

	return (
		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: t(key("title")) }]} />
			<h1 className="mt-6 font-serif text-4xl font-bold">{t(key("title"))}</h1>
			<p className="mt-2 text-sm text-muted-foreground">{t("legal.updated")}</p>
			<p className="mt-6 text-lg text-muted-foreground">{t(key("intro"))}</p>
			<div className="mt-10 space-y-10">
				{sections.map((id) => (
					<section key={id} className="space-y-3 leading-relaxed text-foreground/90">
						<h2 className="font-serif text-2xl font-semibold">{t(key(`${id}.title`))}</h2>
						<Body text={t(key(`${id}.body`), params)} />
					</section>
				))}
			</div>
		</div>
	);
}
