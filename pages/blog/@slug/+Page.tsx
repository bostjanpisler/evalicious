import { useData } from "vike-react/useData";
import { Clock, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { TableOfContents } from "@/components/blog/TableOfContents";
import {
	PortableTextRenderer,
	extractHeadings,
} from "@/components/blog/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Data } from "./+data";

export default function BlogPostPage() {
	const post = useData<Data>();
	const headings = post.content ? extractHeadings(post.content) : [];

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs
				segments={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
			/>

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{/* Main content */}
				<div className="lg:col-span-2">
					{post.coverImage && (
						<OptimizedImage
							image={post.coverImage}
							alt={post.title}
							width={900}
							height={506}
							className="w-full rounded-xl object-cover"
							priority
						/>
					)}

					<div className="mt-6">
						<div className="flex flex-wrap items-start gap-2">
							{post.category && (
								<Badge variant="secondary" className="capitalize">
									{post.category}
								</Badge>
							)}
							{post.tags?.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>

						<h1 className="mt-4 font-serif text-4xl font-bold">{post.title}</h1>

						<div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
							{post.publishedAt && (
								<span>{formatDate(post.publishedAt)}</span>
							)}
							{post.estimatedReadingTime && (
								<span className="flex items-center gap-1.5">
									<Clock className="h-4 w-4" />
									{post.estimatedReadingTime} min branja
								</span>
							)}
						</div>
					</div>

					{post.content && (
						<div className="mt-8">
							<PortableTextRenderer value={post.content} />
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
					{headings.length > 0 && <TableOfContents headings={headings} />}
				</div>
			</div>
		</div>
	);
}
