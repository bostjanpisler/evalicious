import { sanityClient } from "./sanity.js";

export async function isFreePublishedCourse(courseId: string): Promise<boolean> {
	const product = await sanityClient.fetch<{ _id: string }>(
		`*[
			_type == "product" &&
			published == true &&
			type == "ecourse" &&
			priceInCents <= 0 &&
			course._ref == $courseId
		][0]{ _id }`,
		{ courseId },
	);

	return !!product;
}

export async function isFreePublishedEbook(productSlug: string): Promise<boolean> {
	const product = await sanityClient.fetch<{ _id: string }>(
		`*[
			_type == "product" &&
			published == true &&
			type == "ebook" &&
			priceInCents <= 0 &&
			slug.current == $productSlug
		][0]{ _id }`,
		{ productSlug },
	);

	return !!product;
}
