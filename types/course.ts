import type { SanityImageSource } from "@sanity/image-url";

export interface CourseListing {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: SanityImageSource;
	tags?: string[];
	publishedAt?: string;
	stepCount: number;
	totalDuration?: number;
}

export interface CourseOverview {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: SanityImageSource;
	tags?: string[];
	published: boolean;
	publishedAt?: string;
	shopProduct?: {
		slug: string;
		priceInCents: number;
	};
	steps: StepListing[];
}

export interface StepListing {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	sortOrder: number;
	durationMinutes?: number;
	isFree?: boolean;
}

export interface StepRecipe {
	_id: string;
	title: string;
	slug: string;
	coverImage?: unknown;
	prepTime?: number;
	cookTime?: number;
	servings?: number;
	ingredientGroups?: {
		groupName?: string;
		items: { name: string; amount?: string; unit?: string; optional?: boolean }[];
	}[];
	stepGroups?: {
		groupName?: string;
		items: { instruction: string; tip?: string }[];
	}[];
}

export interface StepFull extends StepListing {
	bunnyVideoId?: string;
	hasPdf?: boolean;
	pdfUrl?: string;
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
	recipe?: StepRecipe;
}

export interface CourseFull {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	steps: StepFull[];
}
