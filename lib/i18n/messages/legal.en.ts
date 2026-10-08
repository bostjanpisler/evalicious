import type { Shape } from "../translate";
import type { legalSl } from "./legal.sl";

export const legalEn: Shape<typeof legalSl> = {
	updated: "Last updated: 8 October 2026",
	privacy: {
		title: "Privacy and cookies",
		meta: "How Eva-licious handles personal data, cookies and third-party content.",
		intro:
			"I respect your privacy. This page explains what data I collect, why, who else processes it and what rights you have.",
		controller: {
			title: "Who is responsible",
			body: "The data controller is {name}, {address}. For any privacy question write to {email}.",
		},
		newsletter: {
			title: "Free downloads and newsletter",
			body: "When you request a free download or subscribe to the newsletter I record your email address, language, the consent statement you agreed to, the time and technical details of the request (IP address and browser) as proof of consent. I email you a confirmation or download link. Only when you click the link do I create an account and add you to the contacts for news, recipes and offers.\n\nThe legal basis is your consent. You can withdraw it at any time using the unsubscribe link in every email, or by writing to {email}.",
		},
		account: {
			title: "User account",
			body: "For an account I store your name, email address and a hashed password (I can't see the password itself). If you sign in with Google I receive your name and email from Google. In your account I keep your favourite recipes, lists and course progress. The legal basis is providing the service you ask for by having an account.",
		},
		orders: {
			title: "Purchases",
			body: "When you buy, I process your email address, the product, the amount and payment details. Payment is handled by Stripe; I never see or store your card details. Invoices are issued through Space Invoices. The law requires me to keep invoice records for several years. The legal bases are performing the contract and a legal obligation.",
		},
		analytics: {
			title: "Analytics and chat",
			body: 'Only with your consent I use PostHog (EU servers) for anonymous visit statistics and the HAL chat widget for messages you send me. If you decline or withdraw consent, neither is loaded. You can change your choice with the "Cookie settings" button in the footer.',
		},
		thirdParty: {
			title: "Third-party content",
			body: "Some pages embed maps (Google Maps), offers and ads (Klook), videos (YouTube), posts (TikTok) and photos (Instagram). These providers may set cookies and collect data about your visit. I only load that content with your consent; until then you see a notice instead.",
		},
		affiliate: {
			title: "Affiliate links",
			body: "Some links (for example Booking.com, iHerb, Klook) are affiliate links: if you buy or book through them I earn a small commission at no extra cost to you. After you click such a link, the partner or its network may set its own cookies. Pages with affiliate content carry a notice saying so.",
		},
		logs: {
			title: "Security logs",
			body: "For security and troubleshooting the server briefly records technical details of requests, including the IP address. The legal basis is my legitimate interest in running the site securely.",
		},
		processors: {
			title: "Who else processes data",
			body: "Data is processed on my behalf by providers I have appropriate agreements with:\n• Railway: hosting of the site and database (EU)\n• Amazon Web Services (SES): sending email (Frankfurt)\n• HAL: contacts, email campaigns and chat\n• Stripe: payments\n• Space Invoices: issuing invoices\n• Sanity: content editing\n• PostHog: analytics (EU, only with consent)\n• Bunny: course video\n• Cloudflare: DNS\nWhere a provider transfers data outside the EU, this relies on standard contractual clauses or another lawful mechanism.",
		},
		retention: {
			title: "How long I keep data",
			body: "Newsletter data is kept until you withdraw consent, account data until the account is deleted, invoice records for as long as the law requires. Proof of consent is kept for as long as needed to demonstrate that processing was lawful.",
		},
		rights: {
			title: "Your rights",
			body: "You have the right to access, correct, delete, restrict and port your data, to object to processing, and to withdraw consent. Write to {email} and I will reply within the legal deadline. If you believe I process your data unlawfully you can complain to the Slovenian Information Commissioner (www.ip-rs.si).",
		},
		changes: {
			title: "Changes",
			body: "I may update this page, for example when I add a feature or a provider. The current version is always here, with the date of the last change at the top.",
		},
	},
	terms: {
		title: "Terms of sale",
		meta: "Terms for buying e-books and online courses in the Eva-licious shop.",
		intro: "These terms apply to purchases in the Eva-licious online shop.",
		seller: {
			title: "Seller",
			body: "The seller is {name}, {address}, email {email}.",
		},
		products: {
			title: "Products",
			body: "The shop sells digital content: e-books (PDF files) and online courses. Each product page describes what you get. No physical goods are shipped.",
		},
		prices: {
			title: "Prices and payment",
			body: "Prices are in euros and the final amount is shown before you pay. Payment is processed securely by Stripe; I never receive your card details. You receive an invoice by email.",
		},
		delivery: {
			title: "Delivery",
			body: 'An e-book is available straight after payment: you get a download link by email and under "My orders". Access to a course opens in your account straight after payment.',
		},
		withdrawal: {
			title: "Right of withdrawal",
			body: "When you buy digital content that is delivered immediately and you expressly agree to immediate performance, you lose the 14-day right of withdrawal once performance begins. I point this out and you confirm it with a checkbox before paying. This does not affect your rights if the product is defective.",
		},
		complaints: {
			title: "Complaints",
			body: "If a file or access doesn't work or the product isn't as described, write to {email}. I will fix the problem or, if that isn't possible, refund you.",
		},
		use: {
			title: "Use of content",
			body: "Products are copyrighted works for your personal use. You may not share, resell or publish them without permission.",
		},
		law: {
			title: "Governing law",
			body: "The contract is governed by the law of the Republic of Slovenia. These terms do not limit any mandatory consumer rights you have.",
		},
	},
};
