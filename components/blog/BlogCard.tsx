import { Clock } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/sanity";

interface BlogCardProps {
	post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
	return (
		<a href={`/blog/${post.slug}`}>
			<Card className="group overflow-hidden transition-shadow hover:shadow-lg">
				{post.coverImage && (
					<div className="aspect-[16/9] overflow-hidden">
						<OptimizedImage
							image={post.coverImage}
							alt={post.title}
							width={600}
							height={338}
							sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), (max-width: 1279px) calc(33vw - 2rem), 400px"
							quality={88}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}
				<CardContent className="p-4">
					{post.category && (
						<Badge variant="secondary" className="mb-2 text-xs capitalize">
							{post.category}
						</Badge>
					)}
					<h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">
						{post.title}
					</h3>
					{post.description && (
						<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
					)}
					<div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
						{post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
						{post.estimatedReadingTime && (
							<span className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								{post.estimatedReadingTime} min branja
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</a>
	);
}
