/*
 * Scroll reveal, and the hook behind it.
 *
 * The site had this component but used it in exactly one place, which is why
 * the page read as static: everything below the fold was simply *there* when
 * you arrived at it. Now it wraps the things that should arrive — section
 * headings, feature rows, timeline entries, the contact card — and every one
 * of them settles in from slightly below and slightly behind the page plane.
 *
 * `lift` is the plain version. `depth` adds a small rotateX so the block
 * rotates up into the page rather than only sliding: the same trick the
 * feature stages use, applied to text, which is what makes the scroll feel
 * dimensional rather than merely animated.
 *
 * One observer per element, disconnected the moment it fires — a reveal is a
 * one-shot event, and leaving observers attached to a long page is how a
 * scroll gets expensive. Under prefers-reduced-motion nothing is observed at
 * all and everything renders visible immediately.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** True once the element has entered the viewport at least once. */
export function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reduced motion, or an environment without the API (jsdom, the prerender
    // pass): show the content rather than hiding it behind an event that will
    // never fire.
    if (reduced || typeof IntersectionObserver !== "function") {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      // A low threshold with a bottom margin: the block starts moving as it
      // comes over the fold, not once it is already fully in view.
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return { ref, visible };
}

export default function Reveal({
  children,
  className = "",
  /** Stagger, in milliseconds, for items revealed as a group. */
  delay = 0,
  /** `depth` rotates up into the page as well as sliding. */
  variant = "lift",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "lift" | "depth";
  as?: "div" | "section" | "article" | "li";
}) {
  const { ref, visible } = useRevealed<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      className={`ref-reveal ref-reveal-${variant} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
