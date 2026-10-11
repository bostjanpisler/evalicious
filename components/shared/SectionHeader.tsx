import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
	title: string;
	href?: string;
	linkLabel?: string;
	align?: "start" | "center";
	className?: string;
}

export function SectionHeader({
	title,
	href,
	linkLabel,
	align = "start",
	className,
}: SectionHeaderProps) {
	const centered = align === "center";
	return (
		<div
			className={cn(
				"mb-8 flex items-end gap-4",
				centered ? "justify-center text-center" : "justify-between",
				className,
			)}
		>
			<div>
				<h2 className="font-serif text-3xl font-bold">{title}</h2>
				<span
					aria-hidden
					className={cn("mt-3 block h-0.5 w-12 rounded-full bg-primary", centered && "mx-auto")}
				/>
			</div>
			{href && linkLabel && (
				<a
					href={href}
					className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					{linkLabel}
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
			)}
		</div>
	);
}
