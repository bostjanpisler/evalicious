export interface CourseListing {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: unknown;
	tags?: string[];
	publishedAt?: string;
	stepCount: number;
}

export interface CourseOverview {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	coverImage?: unknown;
	tags?: string[];
	published: boolean;
	publishedAt?: string;
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

export interface StepFull extends StepListing {
	bunnyVideoId?: string;
	pdfUrl?: string;
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
}

export interface CourseFull {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	steps: StepFull[];
}
