import type { PageContextServer } from "vike/types";
import { sanityClient } from "@/server/lib/sanity";
import { blogPostBySlugQuery } from "@/lib/sanity.queries";
import type { BlogPost } from "@/types/sanity";
import { render } from "vike/abort";

export type Data = BlogPost;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const { slug } = pageContext.routeParams;
	const post = await sanityClient.fetch<BlogPost>(blogPostBySlugQuery, { slug });
	if (!post) throw render(404, "Blog post not found");
	return post;
}
