import { useData } from "vike-react/useData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Data } from "./+data";

export default function BlogPage() {
	const { posts } = useData<Data>();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Breadcrumbs segments={[{ label: "Blog" }]} />

			<h1 className="mt-4 font-serif text-4xl font-bold">Blog</h1>
			<p className="mt-2 text-muted-foreground">
				Misli, zgodbe in nasveti iz moje kuhinje in širše.
			</p>

			<div className="mt-8">
				{posts.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Še ni objav na blogu. Preveri kmalu!
					</p>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{posts.map((post) => (
							<BlogCard key={post._id} post={post} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
