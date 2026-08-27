/*
 * Numbers that count up when they arrive.
 *
 * The hero and the feature rows lead with figures — three applications, seven
 * demos, 288 shared lines, 51 tests. A number that animates to its value gets
 * read; a number that is simply printed gets skipped with the rest of the
 * furniture. This is the cheapest honest way to make the page's evidence
 * announce itself.
 *
 * It animates the *presentation* only. The final value is the real one, it is
 * rendered immediately under reduced motion or without IntersectionObserver,
 * and the accessible name is the true figure from the first frame — a screen
 * reader is never read a partial count, and a crawler never sees "0".
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRevealed } from "./Reveal";

const DURATION = 900;

/** Ease-out cubic: fast off the mark, settling onto the value. */
function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({
  value,
  /** Rendered after the number, inside the same element (e.g. "+", "%"). */
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const { ref, visible } = useRevealed<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const frame = useRef(0);

  useEffect(() => {
    if (!visible || reduced || typeof requestAnimationFrame !== "function") {
      setShown(value);
      return;
    }

    const start = performance.now();
    setShown(0);

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      setShown(Math.round(ease(progress) * value));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame.current);
  }, [visible, reduced, value]);

  return (
    <span ref={ref}>
      {/* The true figure, always, for assistive technology and for crawlers. */}
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
    </span>
  );
}
