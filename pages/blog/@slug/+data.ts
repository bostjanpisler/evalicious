import type { PageContextServer } from "vike/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { sanityClient } from "@/server/lib/sanity";
import { blogPostBySlugQuery } from "@/lib/sanity.queries";
import type { BlogPost } from "@/types/sanity";
import { render } from "vike/abort";

export type Data = BlogPost;

export async function data(pageContext: PageContextServer): Promise<Data> {
	const locale = pageContext.locale ?? DEFAULT_LOCALE;
	const { slug } = pageContext.routeParams;
	const post = await sanityClient.fetch<BlogPost>(blogPostBySlugQuery, { slug, locale });
	if (!post) throw render(404, "Blog post not found");
	return post;
}
