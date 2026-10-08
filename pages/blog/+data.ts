import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { allBlogPostsQuery } from "@/lib/sanity.queries";
import type { BlogPost } from "@/types/sanity";

export type Data = { posts: BlogPost[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const posts = await sanityClient.fetch<BlogPost[]>(allBlogPostsQuery, { locale });
	return { posts: posts ?? [] };
}
