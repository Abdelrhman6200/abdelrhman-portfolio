/*
 * Which section the reader is currently in.
 *
 * The home page is one long document with eight destinations in its nav and
 * nothing telling you which one you are looking at — you can scroll for a
 * minute and lose your place entirely. This drives `aria-current` on the nav,
 * so the answer is given to sighted readers and screen readers by the same
 * mechanism rather than by a decoration only one of them can see.
 *
 * IntersectionObserver rather than a scroll handler: the browser does the
 * work off the main thread, so this costs nothing during a scroll. The
 * top-biased root margin means a section counts as "current" once its heading
 * reaches the upper third of the viewport, which is where a reader's attention
 * actually is — not when its last pixel leaves the bottom.
 */
import { useEffect, useState } from "react";

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    // Older browsers, and the prerender pass, simply get no highlight.
    if (typeof IntersectionObserver !== "function") return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        // The most-visible qualifying section wins; ties resolve to document
        // order, which keeps the highlight from flickering between neighbours.
        let best = "";
        let bestRatio = 0;
        for (const id of ids) {
          const ratio = visible.get(id) ?? 0;
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.5, 1] }
    );

    const observed = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    observed.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [ids.join("|")]);

  return active;
}
