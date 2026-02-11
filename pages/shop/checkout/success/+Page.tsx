import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
			<Card className="mx-auto max-w-lg text-center">
				<CardContent className="p-8">
					<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
					<h1 className="mt-6 font-serif text-3xl font-bold">
						Hvala za nakup!
					</h1>
					<p className="mt-3 text-muted-foreground">
						Tvoje naročilo je potrjeno. Do kupljene vsebine lahko dostopaš
						preko nadzorne plošče.
					</p>
					<div className="mt-8">
						<a href="/dashboard/my-recipes">
							<Button>Pojdi na nadzorno ploščo</Button>
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
