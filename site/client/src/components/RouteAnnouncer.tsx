import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Announces client-side navigation and resets focus.
 *
 * In a multi-page site the browser does this for free: a new document moves
 * focus to its top and screen readers announce the new title. A wouter route
 * change does neither — focus stays on the link that was just unmounted, the
 * scroll position persists, and nothing is announced. This restores all three.
 *
 * Focus goes to the new page's h1 (made programmatically focusable but not
 * tab-reachable), which is what most screen-reader users expect after a
 * navigation. The live region carries the announcement for the moment before
 * focus lands.
 */
export default function RouteAnnouncer() {
  const [location] = useLocation();
  const first = useRef(true);

  useEffect(() => {
    // The initial page load is a real document load — the browser already
    // handles it, and stealing focus on arrival would be hostile.
    if (first.current) {
      first.current = false;
      return;
    }

    // Let the incoming route paint (including a lazy chunk's first frame).
    const timer = window.setTimeout(() => {
      const heading = document.querySelector<HTMLHeadingElement>("main h1, h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      window.scrollTo(0, 0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
      }}
    >
      {first.current ? "" : document.title}
    </div>
  );
}
