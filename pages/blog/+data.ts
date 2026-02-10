import { sanityClient } from "@/server/lib/sanity";
import { allBlogPostsQuery } from "@/lib/sanity.queries";
import type { BlogPost } from "@/types/sanity";

export type Data = { posts: BlogPost[] };

export async function data(): Promise<Data> {
	const posts = await sanityClient.fetch<BlogPost[]>(allBlogPostsQuery);
	return { posts: posts ?? [] };
}
