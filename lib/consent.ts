// Cookie/third-party consent. One choice covers analytics, the chat widget and
// third-party embeds (Google Maps, Klook, TikTok, YouTube). It is stored in
// localStorage and announced with a window event so every consumer reacts at once.

export const CONSENT_KEY = "cookie-consent";
const CHANGE_EVENT = "eva-consent-change";
const REOPEN_EVENT = "eva-consent-reopen";

export type ConsentValue = boolean | null;

export function parseConsent(stored: string | null): ConsentValue {
	if (stored === "granted") return true;
	if (stored === "denied") return false;
	return null;
}

export function readConsent(): ConsentValue {
	if (typeof window === "undefined") return null;
	try {
		return parseConsent(window.localStorage.getItem(CONSENT_KEY));
	} catch {
		return null;
	}
}

/** Analytics leave their own cookies and storage behind; remove them when consent is withdrawn. */
export function clearAnalyticsStorage() {
	try {
		for (const key of Object.keys(window.localStorage)) {
			if (key.startsWith("ph_") || key.startsWith("posthog")) window.localStorage.removeItem(key);
		}
		for (const cookie of document.cookie.split("; ")) {
			const name = cookie.split("=")[0] ?? "";
			if (name.startsWith("ph_") || name.startsWith("posthog")) {
				// biome-ignore lint/suspicious/noDocumentCookie: removing our analytics cookies on withdrawal
				document.cookie = `${name}=; path=/; max-age=0`;
			}
		}
	} catch {
		// storage unavailable: nothing to clear
	}
}

export function writeConsent(value: boolean) {
	const previous = readConsent();
	try {
		window.localStorage.setItem(CONSENT_KEY, value ? "granted" : "denied");
	} catch {
		// private mode: the choice just lasts for this page view
	}
	window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: value }));
	if (!value && previous === true) {
		// Scripts that are already running (analytics, chat widget, embeds) can only be unloaded by reloading.
		clearAnalyticsStorage();
		window.location.reload();
	}
}

/** Footer "Cookie settings" link: ask again. */
export function reopenConsent() {
	window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function onConsentChange(callback: (value: ConsentValue) => void): () => void {
	const handler = () => callback(readConsent());
	window.addEventListener(CHANGE_EVENT, handler);
	window.addEventListener("storage", handler);
	return () => {
		window.removeEventListener(CHANGE_EVENT, handler);
		window.removeEventListener("storage", handler);
	};
}

export function onConsentReopen(callback: () => void): () => void {
	window.addEventListener(REOPEN_EVENT, callback);
	return () => window.removeEventListener(REOPEN_EVENT, callback);
}
