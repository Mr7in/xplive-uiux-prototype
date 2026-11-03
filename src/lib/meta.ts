import * as React from "react";

const SITE = "xp.live";
const DEFAULT_DESC = "Live streams, community chat and YES/NO predictions on what happens next.";

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * Sets the tab title and link-preview tags for the current page.
 * In production, render the same values server-side per route so crawlers (Slack, X, Discord) see them.
 */
export function usePageMeta(title?: string, description = DEFAULT_DESC, image?: string) {
  React.useEffect(() => {
    const full = title ? `${title} · ${SITE}` : `${SITE} · Watch live. Call what happens next.`;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", full);
    setMeta("name", "twitter:description", description);
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }
  }, [title, description, image]);
}
