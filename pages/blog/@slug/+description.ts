import type { PageContext } from "vike/types";
import type { Data } from "./+data";

export default (pageContext: PageContext<Data>) =>
	pageContext.data.description ?? `Preberi prispevek ${pageContext.data.title} na Eva-licious.`;
