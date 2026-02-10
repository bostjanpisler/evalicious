"use client";

import { Menu } from "lucide-react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Open menu">
					<Menu className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-72">
				<SheetHeader>
					<SheetTitle className="font-serif text-xl text-primary">{SITE_NAME}</SheetTitle>
				</SheetHeader>
				<nav className="mt-8 flex flex-col gap-4">
					{NAV_ITEMS.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="text-lg font-medium text-foreground transition-colors hover:text-primary"
						>
							{item.label}
						</a>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
