import type { Shape } from "../translate";
import type { commonSl } from "./common.sl";

export const commonEn: Shape<typeof commonSl> = {
	siteDescription:
		"Delicious plant-based food, recipe booklets, cooking courses and workshops, and exploring the world with Eva.",
	siteTagline:
		"Delicious plant-based food, recipe booklets, cooking courses and workshops, and exploring the world.",
	home: "Home",
	nav: {
		recipes: "Recipes",
		courses: "Courses",
		blog: "Blog",
		shop: "Shop",
		travel: "Travel",
		about: "About me",
	},
	footer: {
		explore: "Explore",
		account: "Account",
		login: "Log in",
		register: "Sign up",
		myRecipes: "My recipes",
		rights: "All rights reserved.",
	},
	menu: {
		open: "Open menu",
		myRecipes: "My recipes",
		myCourses: "My courses",
		myOrders: "My orders",
		settings: "Settings",
		logout: "Log out",
		login: "Log in",
		register: "Sign up",
	},
	cookie: {
		text: 'This website uses cookies for visit analytics. By clicking "Accept" you agree to the use of cookies.',
		accept: "Accept",
		deny: "Decline",
	},
	theme: { toggle: "Toggle theme" },
	language: { switchTo: "Switch to Slovenian", label: "Language" },
	error: {
		notFound: "This page could not be found.",
		backHome: "Back to the home page",
		title: "Error",
		unexpected: "An unexpected error occurred. Please try again.",
	},
	affiliate: {
		disclosure:
			"This page contains affiliate links. If you buy or book through them I earn a small commission at no extra cost to you. I only recommend things I actually use or would use.",
		stayTitle: "Where to stay: {place}",
		stayText: "Compare stays and prices on Booking.com.",
		stayButton: "See stays",
		recommended: "Recommended",
		tools: "Tools and ingredients I use",
		seeAt: "See at {shop}",
		see: "See",
	},
};
