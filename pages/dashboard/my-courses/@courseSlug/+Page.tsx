import { usePageContext } from "vike-react/usePageContext";

export default function CourseViewPage() {
	const pageContext = usePageContext();
	const { courseSlug } = pageContext.routeParams;

	return (
		<div className="lg:flex lg:gap-8">
			{/* Chapter sidebar placeholder */}
			<aside className="lg:w-64 lg:flex-shrink-0 mb-6 lg:mb-0">
				<div className="rounded-lg border border-gray-200 p-4">
					<h3 className="font-serif text-lg font-semibold mb-4">
						Poglavja
					</h3>
					<p className="text-sm text-gray-500">
						Stranska vrstica s poglavji se bo naložila tukaj.
					</p>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex-1 min-w-0">
				<h2 className="font-serif text-2xl font-bold mb-4">
					Tečaj: {courseSlug}
				</h2>
				<p className="text-gray-500">
					Izberi lekcijo iz stranske vrstice za začetek.
				</p>
			</div>
		</div>
	);
}
