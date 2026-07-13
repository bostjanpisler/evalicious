"use client";

import { Moon, Sun, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
	const cookie = document.cookie.split("; ").find((c) => c.startsWith("theme="));
	if (cookie) {
		const value = cookie.split("=")[1];
		if (value === "light" || value === "dark" || value === "system") return value;
	}
	return "system";
}

function applyTheme(theme: Theme) {
	const resolved = theme === "system" ? getSystemTheme() : theme;
	const root = document.documentElement;
	if (resolved === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
}

const NEXT_THEME: Record<Theme, Theme> = {
	system: "light",
	light: "dark",
	dark: "system",
};

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("system");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const storedTheme = getStoredTheme();
		setTheme(storedTheme);
		applyTheme(storedTheme);
		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) return;
		applyTheme(theme);
		document.cookie = `theme=${theme};path=/;max-age=31536000`;
	}, [ready, theme]);

	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme((t) => NEXT_THEME[t])}
			aria-label="Preklopi temo"
		>
			{theme === "light" && <Sun className="h-5 w-5" />}
			{theme === "dark" && <Moon className="h-5 w-5" />}
			{theme === "system" && <Sunset className="h-5 w-5" />}
		</Button>
	);
}
