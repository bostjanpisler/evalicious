import { Head } from "vike-react/Head";
import { serializeJsonLd } from "@/lib/structured-data";

export function JsonLd({ data }: { data: unknown }) {
	return (
		<Head>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: serialized, "<"-escaped structured data
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
			/>
		</Head>
	);
}
