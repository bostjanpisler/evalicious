import type { PageContext } from "vike/types";
import type { Data } from "./+data";

export default (pageContext: PageContext<Data>) =>
	pageContext.data.description ?? `Odkrij ${pageContext.data.title} z Evo.`;
