import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Live `prefers-reduced-motion`.
 *
 * Three separate one-shot reads previously existed — one frozen in a
 * `useMemo` with an empty dependency array, two read during render — so a
 * visitor turning the OS setting on mid-session kept the motion until a full
 * reload. That is the exact case the setting exists for: someone turns it on
 * *because* something on screen is making them uncomfortable.
 *
 * The CSS side was always reactive (media queries re-evaluate live); this
 * brings the JS-driven animation into line.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    // Re-sync in case the preference changed between render and effect.
    setReduced(media.matches);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
