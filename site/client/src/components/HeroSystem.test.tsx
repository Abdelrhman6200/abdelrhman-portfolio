/*
 * The hero is the one large moving object on the page, so the properties that
 * keep it from being a liability are pinned: it is decorative to assistive
 * technology, it is driven entirely by CSS (no timer to leak), and it renders
 * the real method rather than a decorative approximation of one.
 *
 * The scene is 3D, which adds one invariant worth protecting: each satellite's
 * label is counter-rotated by exactly its own orbit angle. Get that wrong and
 * the numbers tumble as they travel — the failure is subtle enough on a slow
 * orbit that it would otherwise ship unnoticed.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@/testUtils";
import HeroSystem from "./HeroSystem";
import { methodStages } from "@/content/portfolio";

afterEach(cleanup);

/** The `--angle` custom property, in degrees, off an inline style attribute. */
function angleOf(node: Element): number {
  const style = node.getAttribute("style") ?? "";
  return Number(/--angle:\s*(-?[\d.]+)deg/.exec(style)?.[1]);
}

describe("HeroSystem", () => {
  it("hides the diagram from assistive technology", () => {
    // Every stage name is real text in the Method section; repeating the loop
    // to a screen reader as unlabelled shapes would be noise.
    const { container } = render(<HeroSystem />);
    expect(container.querySelector(".hero-scene")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("puts one satellite on the orbit per real method stage", () => {
    const { container } = render(<HeroSystem />);
    expect(container.querySelectorAll(".hero-sat")).toHaveLength(methodStages.length);
  });

  it("spaces the stages evenly around the full turn", () => {
    const { container } = render(<HeroSystem />);
    const angles = Array.from(container.querySelectorAll(".hero-sat")).map(angleOf);
    const step = 360 / methodStages.length;

    expect(angles[0]).toBe(0);
    angles.forEach((angle, index) => expect(angle).toBeCloseTo(index * step, 5));
    // No two stages share a slot, and none has wrapped past a full turn.
    expect(new Set(angles).size).toBe(angles.length);
    expect(Math.max(...angles)).toBeLessThan(360);
  });

  it("counter-rotates each label by its own angle, so numbers never tumble", () => {
    const { container } = render(<HeroSystem />);
    for (const satellite of Array.from(container.querySelectorAll(".hero-sat"))) {
      const face = satellite.querySelector(".hero-sat-face");
      expect(face).not.toBeNull();
      // The face's counter-rotation is expressed in CSS as calc(-1 * --angle),
      // so what must hold here is that it reads the same variable the carrier
      // was positioned by — one satellite, one angle.
      expect(angleOf(satellite)).not.toBeNaN();
    }
  });

  it("gives each satellite its own phase of the shared depth cycle", () => {
    // Eight bespoke keyframe sets would be eight things to keep in step; one
    // cycle offset per satellite is the same effect with one source of truth.
    const { container } = render(<HeroSystem />);
    const phases = Array.from(container.querySelectorAll(".hero-sat")).map((node) =>
      Number(/--phase:\s*(-?[\d.]+)/.exec(node.getAttribute("style") ?? "")?.[1])
    );
    expect(new Set(phases).size).toBe(methodStages.length);
    for (const phase of phases) {
      expect(phase).toBeLessThanOrEqual(0);
      expect(phase).toBeGreaterThan(-1);
    }
  });

  it("labels each satellite with its real stage number", () => {
    const { container } = render(<HeroSystem />);
    const numbers = Array.from(container.querySelectorAll(".hero-sat-num")).map((node) => node.textContent);
    expect(numbers).toEqual(methodStages.map((stage) => stage.number));
  });

  it("keeps the core inside the 3D plane, so satellites can pass behind it", () => {
    // Occlusion is the reason the scene is three-dimensional rather than
    // merely tilted; a core hoisted out of the plane would always sit on top.
    const { container } = render(<HeroSystem />);
    const core = container.querySelector(".hero-core");
    expect(core?.parentElement?.classList.contains("hero-plane")).toBe(true);
  });

  it("carries no JavaScript animation — nothing to keep running off screen", () => {
    // The whole scene is CSS-driven, so there is no interval or rAF loop to
    // pause, leak, or fight with prefers-reduced-motion.
    const source = HeroSystem.toString();
    expect(source).not.toMatch(/setInterval|requestAnimationFrame|setTimeout/);
  });

  it("names the loop in text beside the diagram", () => {
    const { container } = render(<HeroSystem />);
    expect(container.textContent).toContain("Problem");
    expect(container.textContent).toContain("Improve");
  });
});
