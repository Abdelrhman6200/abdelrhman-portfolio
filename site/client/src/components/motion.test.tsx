/*
 * The motion system: reveal, tilt, counting figures, scroll progress.
 *
 * Decoration is exactly the kind of code that ships broken, because a missing
 * animation looks like a design choice rather than a bug. What these pin is
 * the part that is not decorative: content must never be left hidden, the
 * true figure must always be the accessible one, listeners must come off on
 * unmount, and every effect must be inert when the reader has asked for less
 * motion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Reveal from "./Reveal";
import TiltStage from "./TiltStage";
import CountUp from "./CountUp";
import ScrollProgress from "./ScrollProgress";

/** Drives prefers-reduced-motion for a whole test. */
function setReducedMotion(reduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: reduced && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => setReducedMotion(false));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children whether or not it has been revealed", () => {
    render(<Reveal>the content</Reveal>);
    expect(screen.getByText("the content")).toBeTruthy();
  });

  it("shows content immediately where IntersectionObserver is absent", () => {
    // jsdom, the prerender pass, and old browsers all land here. Content left
    // at opacity 0 waiting for an event that never fires is content lost.
    const { container } = render(<Reveal>content</Reveal>);
    expect(container.querySelector(".ref-reveal")?.classList.contains("is-visible")).toBe(true);
  });

  it("shows content immediately when the reader asked for less motion", () => {
    setReducedMotion(true);
    const { container } = render(<Reveal>content</Reveal>);
    expect(container.querySelector(".ref-reveal")?.classList.contains("is-visible")).toBe(true);
  });

  it("carries its variant so the stylesheet can tell lift from depth", () => {
    const { container } = render(<Reveal variant="depth">content</Reveal>);
    expect(container.querySelector(".ref-reveal-depth")).not.toBeNull();
  });

  it("passes a stagger through as a custom property, and omits it at zero", () => {
    const { container, unmount } = render(<Reveal delay={180}>content</Reveal>);
    expect(container.querySelector(".ref-reveal")?.getAttribute("style")).toContain("--reveal-delay: 180ms");
    unmount();

    const plain = render(<Reveal>content</Reveal>);
    expect(plain.container.querySelector(".ref-reveal")?.getAttribute("style")).toBeNull();
  });

  it("renders as the element it is told to, so lists stay lists", () => {
    const { container } = render(
      <ul>
        <Reveal as="li">a row</Reveal>
      </ul>
    );
    expect(container.querySelector("li.ref-reveal")).not.toBeNull();
  });

  it("disconnects its observer on unmount", () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect = disconnect;
      }
    );
    const { unmount } = render(<Reveal>content</Reveal>);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

describe("CountUp", () => {
  it("gives assistive technology the true figure, never a frame of the count", () => {
    render(<CountUp value={288} />);
    expect(screen.getByText("288")).toBeTruthy();
  });

  it("renders the final value when the reader asked for less motion", () => {
    setReducedMotion(true);
    const { container } = render(<CountUp value={51} />);
    expect(container.textContent).toBe("5151");
  });

  it("appends a suffix to both the spoken and the shown figure", () => {
    setReducedMotion(true);
    const { container } = render(<CountUp value={99} suffix="%" />);
    expect(container.textContent).toBe("99%99%");
  });
});

describe("TiltStage", () => {
  /** jsdom reports a zero-sized box unless one is provided. */
  function withSize(node: Element, box: Partial<DOMRect>) {
    node.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100, ...box }) as DOMRect;
  }

  it("leans towards the pointer and moves the highlight with it", async () => {
    const { container } = render(
      <TiltStage>
        <div className="app-window">surface</div>
      </TiltStage>
    );
    const stage = container.querySelector(".tilt-stage")!;
    withSize(stage, {});

    // Bottom-right quadrant of a 200x100 surface.
    await act(async () => {
      fireEvent.pointerMove(stage, { clientX: 200, clientY: 100, pointerType: "mouse" });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });

    const style = stage.getAttribute("style") ?? "";
    expect(style).toContain("--tilt-px: 100%");
    expect(style).toContain("--tilt-py: 100%");
    // Pointer below centre pulls the near edge up: a negative X rotation.
    expect(style).toMatch(/--tilt-x:\s*-4deg/);
    expect(style).toMatch(/--tilt-y:\s*4deg/);
  });

  it("returns to rest when the pointer leaves", async () => {
    const { container } = render(
      <TiltStage>
        <div className="app-window">surface</div>
      </TiltStage>
    );
    const stage = container.querySelector(".tilt-stage")!;
    withSize(stage, {});

    await act(async () => {
      fireEvent.pointerMove(stage, { clientX: 0, clientY: 0, pointerType: "mouse" });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    fireEvent.pointerLeave(stage);

    const style = stage.getAttribute("style") ?? "";
    expect(style).toContain("--tilt-x: 0deg");
    expect(style).toContain("--tilt-y: 0deg");
  });

  it("ignores touch, where there is no hover to respond to", async () => {
    const { container } = render(<TiltStage>surface</TiltStage>);
    const stage = container.querySelector(".tilt-stage")!;
    withSize(stage, {});

    await act(async () => {
      fireEvent.pointerMove(stage, { clientX: 200, clientY: 100, pointerType: "touch" });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    expect(stage.getAttribute("style")).toBeNull();
  });

  it("stays flat when the reader asked for less motion", async () => {
    setReducedMotion(true);
    const { container } = render(<TiltStage>surface</TiltStage>);
    const stage = container.querySelector(".tilt-stage")!;
    withSize(stage, {});

    await act(async () => {
      fireEvent.pointerMove(stage, { clientX: 200, clientY: 100, pointerType: "mouse" });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    expect(stage.getAttribute("style")).toContain("--tilt-x: 0deg");
  });

  it("does nothing on a surface with no measured size", async () => {
    const { container } = render(<TiltStage>surface</TiltStage>);
    const stage = container.querySelector(".tilt-stage")!;
    withSize(stage, { width: 0, height: 0 });

    await act(async () => {
      fireEvent.pointerMove(stage, { clientX: 10, clientY: 10, pointerType: "mouse" });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    // A zero-width box would divide to NaN and write NaNdeg into the
    // transform, which silently kills it.
    expect(stage.getAttribute("style") ?? "").not.toContain("NaN");
  });
});

describe("ScrollProgress", () => {
  it("is decorative — the document structure already carries this", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector(".scroll-progress")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("reports zero on a page with nothing to scroll", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector(".scroll-progress")?.getAttribute("style")).toContain(
      "--scroll-progress: 0"
    );
  });

  it("takes its listeners off on unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollProgress />);
    unmount();
    const events = remove.mock.calls.map(([name]) => name);
    expect(events).toContain("scroll");
    expect(events).toContain("resize");
    remove.mockRestore();
  });
});
