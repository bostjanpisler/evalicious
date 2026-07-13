import type { PageContext } from "vike/types";
import type { Data } from "./+data";

export default (pageContext: PageContext<Data>) =>
	pageContext.data.description ?? `Razišči recept ${pageContext.data.title} iz Evine kuhinje.`;
