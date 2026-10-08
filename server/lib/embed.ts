// Third-party embeds (Google Maps, Klook widgets, TikTok) are editor-supplied HTML
// stored in Sanity. They are served from their own document, outside the site's
// strict Content-Security-Policy, and sandboxed to an opaque origin so they cannot
// touch the site's cookies, storage or API.
const OPEN_SOURCES = "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'";

/**
 * On the dedicated embed origin the frame keeps that origin (so widgets can use
 * their own storage) and only the site may embed it. Anywhere else, including the
 * main site's own origin, the document is forced into an opaque origin so it can
 * never touch the site's cookies, storage or API, even when opened directly.
 */
export function embedCsp(onEmbedOrigin: boolean, siteOrigins: string[]): string {
	if (onEmbedOrigin) {
		return [OPEN_SOURCES, `frame-ancestors ${siteOrigins.join(" ") || "'none'"}`].join("; ");
	}
	return [
		OPEN_SOURCES,
		"sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms",
		"frame-ancestors 'self'",
	].join("; ");
}

export const EMBED_DOC_ID = /^[A-Za-z0-9._-]{1,100}$/;
export const EMBED_KEY = /^[A-Za-z0-9_-]{1,64}$/;

export function renderEmbedDocument(code: string, key: string): string {
	// The inline script reports the content height so the page can size the frame.
	const reporter = `(function(){var k=${JSON.stringify(key)};function s(){parent.postMessage({type:"eva-embed-height",key:k,height:Math.ceil(document.body.getBoundingClientRect().height)},"*")}if(window.ResizeObserver){new ResizeObserver(s).observe(document.body)}window.addEventListener("load",s);setTimeout(s,500);setTimeout(s,2000)})();`;
	return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent}body{overflow-x:hidden}iframe{display:block;max-width:100%}</style></head><body>${code}<script>${reporter}</script></body></html>`;
}
