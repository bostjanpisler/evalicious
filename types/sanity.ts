import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface SanityDocument {
	_id: string;
	_type: string;
	_createdAt: string;
	_updatedAt: string;
}

export interface BlogPost {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: SanityImageSource;
	category?: string;
	tags?: string[];
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
	published?: boolean;
	publishedAt?: string;
	estimatedReadingTime?: number;
}

export interface TravelEntry {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: SanityImageSource;
	location?: string;
	country?: string;
	tags?: string[];
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
	published?: boolean;
	publishedAt?: string;
}

export interface Product {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: SanityImageSource;
	type: "ebook" | "ecourse" | "offline_course";
	priceInCents: number;
	currency: string;
	stripePriceId?: string;
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	longDescription?: any[];
	featured?: boolean;
	tags?: string[];
	courseStepCount?: number;
	courseTotalDuration?: number;
	course?: {
		_id: string;
		title: string;
		slug: string;
		description?: string;
		stepCount?: number;
		totalDuration?: number;
	};
}

export interface HomePage {
	heroTitle?: string;
	heroSubtitle?: string;
	heroImage?: SanityImageSource;
	featuredRecipes?: Array<{
		_id: string;
		title: string;
		slug: string;
		coverImage?: SanityImageSource;
		category?: string;
		difficulty?: string;
		prepTime?: number;
		cookTime?: number;
	}>;
	featuredProducts?: Array<{
		_id: string;
		title: string;
		slug: string;
		description?: string;
		coverImage?: SanityImageSource;
		priceInCents: number;
		currency: string;
		type: "ebook" | "ecourse" | "offline_course";
		courseStepCount?: number;
		courseTotalDuration?: number;
	}>;
	recentRecipes?: import("@/types/recipe").RecipeListing[];
	recentBlogPosts?: BlogPost[];
	recentTravelEntries?: TravelEntry[];
	courses?: import("@/types/course").CourseListing[];
}

export interface AboutPage {
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	bio?: any[];
	profileImage?: SanityImageSource;
	contactEmail?: string;
	socialLinks?: Array<{ platform: string; url: string }>;
}
