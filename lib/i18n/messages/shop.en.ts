import type { Shape } from "../translate";
import type { shopSl } from "./shop.sl";

export const shopEn: Shape<typeof shopSl> = {
	title: "Shop | Eva-licious",
	breadcrumb: "Shop",
	list: {
		heading: "Shop",
		intro: "E-books, courses and more to take your cooking to the next level.",
		emptyTitle: "No products yet",
		emptyText: "We're busy preparing new things. Check back soon!",
		emptyLink: "In the meantime, explore the recipes →",
	},
	types: {
		ebook: "E-book",
		ecourse: "Online course",
		offline_course: "Live course",
	},
	steps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
	price: {
		free: "Free",
	},
	product: {
		pdf: "PDF",
		instantDownload: "Instant download",
		courseContent: "Course content",
		freeAccess: "Free access",
		startCourse: "Start the course",
		alreadyOwned: "Already purchased",
		goToCourse: "Go to the course",
		myOrders: "My orders",
	},
	buy: {
		loading: "Loading...",
		redirecting: "Redirecting...",
		loginToBuy: "Log in or sign up to buy",
		buyNow: "Buy now",
		alreadyOwned: "You already have this product in your orders.",
		cannotStart: "We can't start the payment right now. Please try again later.",
		termsBefore: "I agree to the ",
		termsLink: "terms of sale",
		termsAfter:
			" and request immediate delivery of the digital content. I understand that I lose my right of withdrawal.",
		termsRequired: "Please accept the terms of sale to continue.",
		startError: "Something went wrong starting the payment. Please try again.",
	},
	freeDownload: {
		consent:
			"I agree that Eva-licious may email me the free material, plus the occasional news, recipes and offers. I can unsubscribe at any time.",
		linkExpired: "Your download link has expired. Enter your email and we'll send you a new one.",
		consentRequired: "We need your consent to send the download.",
		checkEmail: "Please check your email address.",
		tooMany: "Too many requests. Please try again in a few minutes.",
		sendFailed: "We can't send it right now. Please try again later.",
		genericError: "Something went wrong. Please try again.",
		sentTitle: "Check your inbox",
		sentTo: "We've sent the download link to {email}.",
		emailLabel: "Email",
		emailPlaceholder: "you@email.com",
		sending: "Sending...",
		submit: "Send it to me for free",
		accountNote:
			"When you download, we'll create an Eva-licious account for you, where you can set a password.",
	},
	checkout: {
		thanks: "Thank you for your purchase!",
		processingTitle: "We're processing your payment",
		failedTitle: "We couldn't confirm your payment",
		confirmedText: "Your order is confirmed. We've sent a confirmation to your email address.",
		processingText:
			"Your payment went through and we're still preparing your order. Refresh the page in a few moments.",
		failedText: "Check the status of your payment, or head back to the shop and try again.",
		downloadEbook: "Download your e-book",
		startCourse: "Start the course",
		myOrders: "My orders",
		backToShop: "Back to the shop",
	},
};
