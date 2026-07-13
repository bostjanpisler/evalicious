"use client";

import { Heart, LogOut, Settings, User } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capture } from "@/lib/analytics-client";
import { authClient } from "@/lib/auth-client";

export function UserMenu() {
	const pageContext = usePageContext();
	const user = (pageContext as Record<string, unknown>).user as {
		name: string;
		email: string;
	} | null;

	if (!user) {
		return (
			<div className="hidden items-center gap-2 md:flex">
				<Button variant="ghost" size="sm" asChild>
					<a href="/login">Prijava</a>
				</Button>
				<Button size="sm" asChild>
					<a href="/register">Registracija</a>
				</Button>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="hidden md:flex">
					<User className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<div className="px-2 py-1.5">
					<p className="text-sm font-medium">{user.name}</p>
					<p className="text-xs text-muted-foreground">{user.email}</p>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<a href="/dashboard/my-recipes">
						<Heart className="mr-2 h-4 w-4" />
						Moji recepti
					</a>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<a href="/dashboard/settings">
						<Settings className="mr-2 h-4 w-4" />
						Nastavitve
					</a>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						capture("sign_out");
						await authClient.signOut();
						window.location.href = "/";
					}}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Odjava
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
