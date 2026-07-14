import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
	const pageContext = usePageContext();
	const { is404, abortReason } = pageContext;

	if (is404) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
				<h1 className="font-serif text-6xl font-bold">404</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					{typeof abortReason === "string" ? abortReason : "Te strani ni mogoče najti."}
				</p>
				<div className="mt-8">
					<Button asChild>
						<a href="/">Nazaj na domačo stran</a>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="font-serif text-6xl font-bold">Napaka</h1>
			<p className="mt-4 text-lg text-muted-foreground">
				Prišlo je do nepričakovane napake. Poskusi znova.
			</p>
			<div className="mt-8">
				<Button asChild>
					<a href="/">Nazaj na domačo stran</a>
				</Button>
			</div>
		</div>
	);
}
