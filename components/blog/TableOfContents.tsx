"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useI18n } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

interface Heading {
	key: string;
	text: string;
	level: number;
}

interface TableOfContentsProps {
	headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
	const { t } = useI18n();
	const [isOpen, setIsOpen] = useState(true);
	const activeId = useIntersectionObserver(headings.map((h) => h.key));

	if (headings.length === 0) return null;

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<div className="rounded-lg border border-border bg-card p-4">
				<CollapsibleTrigger className="flex w-full items-center justify-between">
					<h3 className="font-semibold text-foreground">{t("blog.toc")}</h3>
					<ChevronDown
						className={cn(
							"h-4 w-4 text-muted-foreground transition-transform",
							isOpen && "rotate-180",
						)}
					/>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<nav className="mt-3 space-y-1">
						{headings.map((heading) => (
							<a
								key={heading.key}
								href={`#${heading.key}`}
								onClick={(e) => {
									e.preventDefault();
									document.getElementById(heading.key)?.scrollIntoView({
										behavior: "smooth",
									});
								}}
								className={cn(
									"block rounded px-2 py-1 text-sm transition-colors hover:text-foreground",
									heading.level === 3 && "pl-6",
									heading.level === 4 && "pl-10",
									activeId === heading.key
										? "bg-primary/10 font-medium text-primary"
										: "text-muted-foreground",
								)}
							>
								{heading.text}
							</a>
						))}
					</nav>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
