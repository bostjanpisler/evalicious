export interface CourseListing {
	_id: string;
	title: string;
	description?: string;
	product?: {
		slug: string;
		coverImage?: unknown;
		priceInCents: number;
	};
}

export interface Chapter {
	_id: string;
	title: string;
	description?: string;
	sortOrder: number;
	lessons: LessonListing[];
}

export interface LessonListing {
	_id: string;
	title: string;
	durationMinutes?: number;
	isFree?: boolean;
	sortOrder: number;
}

export interface LessonFull extends LessonListing {
	description?: string;
	videoUrl?: string;
	videoPlatform?: string;
	pdfFile?: { url: string };
	// biome-ignore lint/suspicious/noExplicitAny: Portable Text content
	content?: any[];
}
