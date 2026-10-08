// Who runs the site. Shown on the privacy policy and the shop terms.
export const LEGAL = {
	name: "Eva Sušin s.p.",
	address: "Konovska cesta 48, 3320 Velenje",
	email: "info@eva-licious.com",
} as const;

export const PRIVACY_SECTIONS = [
	"controller",
	"newsletter",
	"account",
	"orders",
	"analytics",
	"thirdParty",
	"affiliate",
	"logs",
	"processors",
	"retention",
	"rights",
	"changes",
] as const;

export const TERMS_SECTIONS = [
	"seller",
	"products",
	"prices",
	"delivery",
	"withdrawal",
	"complaints",
	"use",
	"law",
] as const;

/** Bump when the shop terms change in substance; recorded with each order. */
export const TERMS_VERSION = "2026-10-08";
