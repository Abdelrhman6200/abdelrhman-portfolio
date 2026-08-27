/*
 * How far through the document you are.
 *
 * The home page is one long argument in nine sections. A reader who lands
 * mid-scroll from a shared link has no idea whether they are near the start
 * or the end of it, and the nav's active-section highlight answers "where"
 * but not "how much left". This is the second half of that answer.
 *
 * It writes a CSS custom property rather than React state: a scroll handler
 * that re-renders the page's whole component tree is the classic way to make
 * a site feel heavy. The listener is passive and coalesced into an animation
 * frame, so a flung scroll produces one style write per frame.
 *
 * Decorative and aria-hidden — the same information is already available to a
 * screen reader through the document structure, and a progressbar role that
 * updates on every frame would be noise.
 */
import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // The scrollable distance, not the document height: on a page shorter
      // than the viewport this is 0, and the bar simply stays empty.
      const total = doc.scrollHeight - doc.clientHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, doc.scrollTop / total)) : 0;
      node.style.setProperty("--scroll-progress", String(progress));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
