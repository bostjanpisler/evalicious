import { capture } from "@/lib/analytics-client";

export function onPageTransitionEnd() {
	capture("$pageview");
}
