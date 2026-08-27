/*
 * Pointer-reactive 3D for the application-window stages.
 *
 * The feature and case-file stages already tilted, but only into one fixed
 * pose on hover — the same angle wherever the cursor was, which reads as a
 * CSS trick rather than as an object sitting in space. This makes the tilt
 * track the pointer: the surface leans towards wherever you are on it, and
 * the highlight moves across it, so the window behaves like a panel you are
 * looking at from an angle rather than a picture of one.
 *
 * The angles are deliberately small. A big tilt is a gimmick and it makes the
 * screenshot inside unreadable; four degrees is enough for the brain to read
 * depth and not enough to fight the content.
 *
 * Cost control: the handler writes two CSS custom properties and nothing
 * else — no React state, so no re-render per pointer move — and the write is
 * coalesced into an animation frame, so a fast drag across the card produces
 * one write per frame rather than one per event. Touch is left alone
 * entirely: there is no hover on a touch screen, and a tilt that fires on tap
 * is just a flicker.
 */
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Maximum lean, in degrees, at the very edge of the surface. */
const MAX_TILT = 4;

export default function TiltStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-px", "50%");
    node.style.setProperty("--tilt-py", "50%");
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType === "touch") return;
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Normalised to -0.5…0.5 from the centre of the surface.
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        // Y movement leans the surface about the X axis, and vice versa —
        // negated so the edge nearest the pointer comes towards the viewer.
        node.style.setProperty("--tilt-x", `${-y * MAX_TILT * 2}deg`);
        node.style.setProperty("--tilt-y", `${x * MAX_TILT * 2}deg`);
        node.style.setProperty("--tilt-px", `${(x + 0.5) * 100}%`);
        node.style.setProperty("--tilt-py", `${(y + 0.5) * 100}%`);
      });
    },
    [reduced]
  );

  // A queued frame must not run after unmount, and the pose must not be left
  // leaning when the preference flips to reduced mid-session.
  useEffect(() => {
    if (reduced) reset();
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [reduced, reset]);

  return (
    <div
      ref={ref}
      className={`tilt-stage ${className}`.trim()}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}
