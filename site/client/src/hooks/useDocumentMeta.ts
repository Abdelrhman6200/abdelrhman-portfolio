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
 * The origin is read from the browser rather than baked in. This hook only
 * runs in a browser, where window.location.origin is by definition the right
 * answer — and it stays right on a preview deploy or a custom domain without
 * a rebuild. Crawlers never reach this code: the prerendered shells already
 * carry the correct static canonical for every route.
 *
 * It previously read a "__SITE_URL__" token said to be injected at build
 * time. The Vite plugin that injects it uses transformIndexHtml, which
 * rewrites HTML and not JavaScript, so the token shipped verbatim in the
 * bundle and the fallback below was the only branch that ever ran.
 */

function origin(): string {
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
