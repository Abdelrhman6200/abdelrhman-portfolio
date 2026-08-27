/*
 * The hero's living system.
 *
 * Chosen over a WebGL scene deliberately. The site's argument is evidence over
 * decoration, so the one large moving object on the page should mean something
 * rather than merely impress: this is the eight-stage method itself, drawn as
 * the loop it is, with work circulating through it. The stage the pulse is
 * passing lights up, so the diagram is the thesis rather than an ornament.
 *
 * Implemented as SVG + CSS animation with no JavaScript timer and no library —
 * about 2 KB against the ~150 KB gzipped that three.js would have cost, and it
 * inherits the theme tokens, so it is correct in both palettes and covered by
 * the contrast suite. Under prefers-reduced-motion every animation stops and
 * the diagram holds as a static, fully legible still.
 */
import { methodStages } from "@/content/portfolio";

/** Ring geometry, in the SVG's own coordinate space. */
const CENTRE = 130;
const RADIUS = 96;
const PULSES = 3;

function pointAt(index: number, total: number, radius = RADIUS) {
  // Start at the top so the loop reads clockwise from "Problem".
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTRE + Math.cos(angle) * radius,
    y: CENTRE + Math.sin(angle) * radius,
  };
}

export default function HeroSystem() {
  const total = methodStages.length;
  const nodes = methodStages.map((stage, index) => ({ ...stage, ...pointAt(index, total) }));

  return (
    <div className="hero-system">
      {/*
        Decorative: the stage names are rendered as real text in the Method
        section below, and the hero's meaning is carried by the copy beside it.
      */}
      <svg viewBox="0 0 260 260" className="hero-system-svg" aria-hidden="true">
        <defs>
          <radialGradient id="hero-core-glow">
            <stop offset="0%" stopColor="var(--ref-coral)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--ref-coral)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTRE} cy={CENTRE} r={RADIUS + 26} fill="url(#hero-core-glow)" />

        {/* Chords across the loop: every stage informs the others, which is the
            point of running it as a cycle rather than a checklist. */}
        <g className="hero-chords">
          {nodes.map((node, index) => {
            const opposite = nodes[(index + 3) % total];
            return (
              <line
                key={`chord-${node.number}`}
                x1={node.x}
                y1={node.y}
                x2={opposite.x}
                y2={opposite.y}
                style={{ animationDelay: `${index * 0.35}s` }}
              />
            );
          })}
        </g>

        {/* The loop itself, drawing itself in on first paint. */}
        <circle className="hero-ring" cx={CENTRE} cy={CENTRE} r={RADIUS} />

        {/* Stage nodes, lighting in sequence as the pulse passes. */}
        <g className="hero-nodes">
          {nodes.map((node, index) => (
            <g key={node.number} style={{ animationDelay: `${(index / total) * 8}s` }}>
              <circle cx={node.x} cy={node.y} r="7" className="hero-node-halo" />
              <circle cx={node.x} cy={node.y} r="4.5" className="hero-node" />
            </g>
          ))}
        </g>

        {/* Work circulating. Each group rotates about the centre; the dot sits
            on the ring, so rotation carries it around the loop. */}
        <g className="hero-pulses">
          {Array.from({ length: PULSES }, (_, index) => (
            <g key={index} style={{ animationDelay: `${index * -(8 / PULSES)}s` }}>
              <circle cx={CENTRE} cy={CENTRE - RADIUS} r="5" className="hero-pulse" />
            </g>
          ))}
        </g>

        <circle cx={CENTRE} cy={CENTRE} r="42" className="hero-core" />
        <text x={CENTRE} y={CENTRE + 4} className="hero-core-mark">
          AS
        </text>
        <text x={CENTRE} y={CENTRE + 22} className="hero-core-sub">
          THE LOOP
        </text>
      </svg>

      <p className="hero-system-caption">
        <span>08 STAGES</span> Problem → Understand → Map → Design → Build → Automate → Measure → Improve
      </p>
    </div>
  );
}
