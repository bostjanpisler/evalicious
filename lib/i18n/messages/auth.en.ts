import type { Shape } from "../translate";
import type { authSl } from "./auth.sl";

export const authEn: Shape<typeof authSl> = {
	errors: {
		generic: "Something went wrong. Please try again.",
	},
	userMenu: {
		open: "Open user menu",
	},
	login: {
		title: "Log in | Eva-licious",
		heading: "Welcome back",
		description: "Log in to your account",
		email: "Email",
		emailPlaceholder: "you@email.com",
		password: "Password",
		submit: "Log in",
		submitting: "Logging in...",
		invalid: "Your email or password isn't right.",
		noAccount: "Don't have an account yet?",
		registerLink: "Sign up",
	},
	register: {
		title: "Sign up | Eva-licious",
		heading: "Create an account",
		description: "Join the Eva-licious community",
		name: "Name",
		namePlaceholder: "Eva",
		email: "Email",
		emailPlaceholder: "you@email.com",
		password: "Password",
		passwordPlaceholder: "At least 8 characters",
		submit: "Create account",
		submitting: "Creating your account...",
		failed: "We couldn't sign you up. Please check your details and try again.",
		haveAccount: "Already have an account?",
		loginLink: "Log in",
	},
	reset: {
		title: "Set your password | Eva-licious",
		heading: "Set your password",
		description: "Choose a password for your Eva-licious account",
		done: "Your password is set. You can log in now.",
		login: "Log in",
		newPassword: "New password",
		submit: "Save password",
		submitting: "Saving...",
		tooShort: "Your password needs to be at least 8 characters.",
		invalidLink: "This link is invalid or has expired.",
	},
};
