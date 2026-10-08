import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_SECTIONS } from "@/lib/legal";

export default function Page() {
	return <LegalDocument kind="terms" sections={TERMS_SECTIONS} />;
}
