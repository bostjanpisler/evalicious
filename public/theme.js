(() => {
	try {
		const match = document.cookie.match(/(?:^|; )theme=(light|dark|system)/);
		const theme = match ? match[1] : "system";
		const dark =
			theme === "dark" ||
			(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList.toggle("dark", dark);
	} catch (_) {}
})();
