import type { SVGProps } from "react";

export function SugarCubesIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<rect width="7" height="7" x="4" y="10" rx="1.5" />
			<rect width="7" height="7" x="10" y="5" rx="1.5" />
			<rect width="7" height="7" x="13" y="13" rx="1.5" />
		</svg>
	);
}
