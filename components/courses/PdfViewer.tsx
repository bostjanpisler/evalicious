interface PdfViewerProps {
	url: string;
	title?: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="font-serif text-lg font-semibold">
						{title ?? "PDF Document"}
					</h4>
					<p className="text-sm text-gray-500 mt-1">
						Download or view this document.
					</p>
				</div>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Download PDF
				</a>
			</div>
		</div>
	);
}
