/*
 * The simulation is the most animated thing on the site, so the properties that
 * keep it from being a liability — reduced-motion support, no clock while off
 * screen, and being hidden from assistive tech — are pinned here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import SystemSimulation, { type SimulationSpec } from "./SystemSimulation";
import { simulationFor, simulations } from "@/content/simulations";
import { allProjects } from "@/content/portfolio";

const spec: SimulationSpec = {
  unit: "record",
  units: "records",
  tickMs: 100,
  startCount: 5,
  stages: [
    { label: "In", detail: "Work arrives." },
    { label: "Mid", detail: "Work is transformed." },
    { label: "Out", detail: "Work leaves." },
  ],
};

/** Controls what `matchMedia` reports for prefers-reduced-motion. */
function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/** Observer whose visibility we drive by hand. */
let triggerIntersect: ((isIntersecting: boolean) => void) | null = null;

beforeEach(() => {
  triggerIntersect = null;
  setReducedMotion(false);

  class ControlledObserver {
    constructor(private callback: IntersectionObserverCallback) {
      triggerIntersect = (isIntersecting: boolean) =>
        this.callback([{ isIntersecting } as IntersectionObserverEntry], this as never);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: ControlledObserver,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SystemSimulation", () => {
  it("stays still until it is scrolled into view", () => {
    vi.useFakeTimers();
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Never intersected, so no clock ran and nothing completed.
    expect(container.querySelector(".sim")).not.toHaveProperty("dataset.running", "true");
    expect(container.textContent).toContain("5");
  });

  it("advances work through the pipeline once visible", () => {
    vi.useFakeTimers();
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);

    act(() => {
      triggerIntersect?.(true);
    });
    act(() => {
      // Three stages at 100ms: enough for at least one unit to exit.
      vi.advanceTimersByTime(600);
    });

    const completed = Number(container.querySelector(".sim-meter b")?.textContent);
    expect(completed).toBeGreaterThan(5);
  });

  it("can be paused", () => {
    vi.useFakeTimers();
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);

    act(() => {
      triggerIntersect?.(true);
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    const afterRun = Number(container.querySelector(".sim-meter b")?.textContent);

    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(Number(container.querySelector(".sim-meter b")?.textContent)).toBe(afterRun);
  });

  it("runs no clock at all under prefers-reduced-motion", () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);

    act(() => {
      triggerIntersect?.(true);
      vi.advanceTimersByTime(5000);
    });

    // Still frame: the seeded count is untouched and no pause control exists.
    expect(container.querySelector(".sim-meter b")?.textContent).toBe("5");
    expect(screen.queryByRole("button", { name: /pause|play/i })).toBeNull();
    expect(container.textContent).toContain("STILL FRAME");
  });

  it("hides the moving rail from assistive technology", () => {
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);
    expect(container.querySelector(".sim-rail")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("states every stage name as real text, not only as animation", () => {
    const { container } = render(<SystemSimulation spec={spec} label="Test pipeline" />);
    for (const stage of spec.stages) {
      expect(container.textContent).toContain(stage.label);
    }
  });
});

describe("simulation specs", () => {
  it("gives every project a simulation with at least two stages", () => {
    for (const project of allProjects) {
      const resolved = simulationFor(project.kind, project.flow, project.accent);
      expect(resolved.stages.length, project.title).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps bespoke simulation stages aligned with the documented flow", () => {
    for (const project of allProjects) {
      const bespoke = simulations[project.kind];
      if (!bespoke) continue;
      expect(bespoke.stages.length, project.title).toBe(project.flow.length);
    }
  });

  it("writes a detail line for every stage", () => {
    for (const [kind, sim] of Object.entries(simulations)) {
      for (const stage of sim.stages) {
        expect(stage.detail.length, `${kind}/${stage.label}`).toBeGreaterThan(10);
      }
    }
  });
});
