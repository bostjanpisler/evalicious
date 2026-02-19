import posthog from "posthog-js";

export function onPageTransitionEnd() {
	if (posthog.__loaded) {
		posthog.capture("$pageview");
	}
}
