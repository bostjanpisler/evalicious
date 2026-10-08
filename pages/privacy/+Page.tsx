import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_SECTIONS } from "@/lib/legal";

export default function Page() {
	return <LegalDocument kind="privacy" sections={PRIVACY_SECTIONS} />;
}
