/*
 * The hero is the one large moving object on the page, so the properties that
 * keep it from being a liability are pinned: it is decorative to assistive
 * technology, it is driven entirely by CSS (no timer to leak), and it renders
 * the real method rather than a decorative approximation of one.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@/testUtils";
import HeroSystem from "./HeroSystem";
import { methodStages } from "@/content/portfolio";

afterEach(cleanup);

describe("HeroSystem", () => {
  it("hides the diagram from assistive technology", () => {
    // Every stage name is real text in the Method section; repeating the loop
    // to a screen reader as unlabelled shapes would be noise.
    const { container } = render(<HeroSystem />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws one node per real method stage", () => {
    const { container } = render(<HeroSystem />);
    expect(container.querySelectorAll(".hero-node")).toHaveLength(methodStages.length);
  });

  it("places the nodes on the ring, evenly and without collisions", () => {
    const { container } = render(<HeroSystem />);
    const points = Array.from(container.querySelectorAll<SVGCircleElement>(".hero-node")).map((node) => ({
      x: Number(node.getAttribute("cx")),
      y: Number(node.getAttribute("cy")),
    }));

    // Every node sits at the ring radius from the centre.
    for (const point of points) {
      const distance = Math.hypot(point.x - 130, point.y - 130);
      expect(Math.round(distance)).toBe(96);
    }
    // No two nodes land on the same spot.
    const keys = points.map((point) => `${Math.round(point.x)},${Math.round(point.y)}`);
    expect(new Set(keys).size).toBe(points.length);
  });

  it("starts the loop at the top so it reads from the first stage", () => {
    const { container } = render(<HeroSystem />);
    const first = container.querySelector<SVGCircleElement>(".hero-node");
    expect(Math.round(Number(first?.getAttribute("cx")))).toBe(130);
    expect(Math.round(Number(first?.getAttribute("cy")))).toBe(34);
  });

  it("carries no JavaScript animation — nothing to keep running off screen", () => {
    // The whole diagram is CSS-driven, so there is no interval or rAF loop to
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
