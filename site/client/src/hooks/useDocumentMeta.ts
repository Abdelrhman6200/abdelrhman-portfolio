import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Per-route title, description and canonical URL.
 *
 * The site is a client-rendered SPA serving one index.html for every path, so
 * the shell's static tags applied to all nine-plus routes. The canonical was
 * the damaging one: every deep URL declared itself a duplicate of the home
 * page, which instructs search engines to drop /system/* and /demo/*. These
 * tags are now rewritten per route, so each URL is self-referential.
 *
 * `origin` is injected at build time by the inject-site-url Vite plugin, so it
 * matches whatever domain the bundle was built for.
 */

const SITE_ORIGIN = "__SITE_URL__";

/** The build-time token survives only if the plugin did not run (e.g. tests). */
function origin(): string {
  if (!SITE_ORIGIN.startsWith("__")) return SITE_ORIGIN;
  return typeof window === "undefined" ? "" : window.location.origin;
}

function setMeta(selector: string, attr: "content" | "href", value: string) {
  const element = document.head.querySelector<HTMLElement>(selector);
  if (element) element.setAttribute(attr, value);
}

export function useDocumentMeta({
  title,
  description,
}: {
  /** Page-specific part; the site name is appended. */
  title: string;
  description: string;
}) {
  const [location] = useLocation();

  useEffect(() => {
    const full = title ? `${title} — Abdelrhman Shoman` : "Abdelrhman Shoman — Systems Builder";
    const url = `${origin()}${location === "/" ? "/" : location}`;

    document.title = full;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", full);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", full);
    setMeta('meta[name="twitter:description"]', "content", description);
    // The two that were actively harmful when left pointing at the root.
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('link[rel="canonical"]', "href", url);
  }, [title, description, location]);
}
