/*
 * The hero's living system — now an actual three-dimensional one.
 *
 * The first version drew the eight-stage method as a flat SVG ring with dots
 * travelling around it. This is the same idea given real depth: the stages
 * orbit a core on a plane tilted away from the viewer, so they pass genuinely
 * in front of and behind it, and the browser's own perspective makes the near
 * ones larger without a line of code asking for it.
 *
 * Still no WebGL and still no library. It is CSS 3D transforms — a tilted
 * `preserve-3d` plane, a spin, and a counter-spin on each label so the text
 * stays face-on while its carrier orbits. Every transform is GPU-composited,
 * there is no JavaScript timer to leak or to fight prefers-reduced-motion,
 * and it costs bytes rather than the ~150 KB gzipped that three.js would.
 *
 * The choice is the same one as before: the site argues evidence over
 * decoration, so the one large moving object on the page is the method
 * itself, not an ornament. Depth was added because the loop genuinely has a
 * front and a back — work in progress passes behind the thing it feeds.
 *
 * Under prefers-reduced-motion the spin stops and the scene holds as a
 * static, fully legible tilted still: the base transforms already describe
 * that still, so stopping the animation is all it takes.
 */
import type { CSSProperties } from "react";
import { methodStages } from "@/content/portfolio";

/** Degrees between neighbouring stages on the orbit. */
const STEP = 360 / methodStages.length;

export default function HeroSystem() {
  return (
    <div className="hero-system">
      {/*
        Decorative: every stage name is real text in the Method section below,
        and the hero's meaning is carried by the copy beside it. Announcing
        eight unlabelled orbiting shapes would be noise.
      */}
      <div className="hero-scene" aria-hidden="true">
        <div className="hero-plane">
          <div className="hero-disc" />
          <div className="hero-disc hero-disc-inner" />

          <div className="hero-spin">
            {methodStages.map((stage, index) => (
              <div
                key={stage.number}
                className="hero-sat"
                style={
                  {
                    "--angle": `${index * STEP}deg`,
                    // Each satellite is one slot further round the cycle, so
                    // its depth cue is the same animation played from a
                    // different point rather than eight bespoke keyframes.
                    "--phase": `${-index / methodStages.length}`,
                  } as CSSProperties
                }
              >
                {/* Counter-rotated so the label faces the viewer throughout. */}
                <div className="hero-sat-face">
                  <span className="hero-sat-dot" />
                  <span className="hero-sat-num">{stage.number}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inside the 3D context, so satellites genuinely pass behind it. */}
          <div className="hero-core">
            <span className="hero-core-mark">AS</span>
            <span className="hero-core-sub">THE LOOP</span>
          </div>
        </div>
      </div>

      <p className="hero-system-caption">
        <span>08 STAGES</span> {methodStages.map((stage) => stage.name).join(" → ")}
      </p>
    </div>
  );
}
