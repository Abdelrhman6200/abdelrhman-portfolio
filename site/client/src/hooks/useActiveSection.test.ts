/*
 * The hook must never be the reason a page fails to render. jsdom has no
 * IntersectionObserver, which is also true of the prerender pass and of old
 * browsers — so "no highlight" is the correct outcome there, not a crash.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

const ids = ["about", "work", "contact"];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useActiveSection", () => {
  it("degrades to no highlight where IntersectionObserver is absent", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() => useActiveSection(ids));
    expect(result.current).toBe("");
  });

  it("observes each section that exists, and skips ids that do not", () => {
    const observed: Element[] = [];
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(_callback: unknown, options: { rootMargin?: string }) {
          // A top-biased margin is the behaviour: a section becomes current
          // when its heading reaches the upper part of the viewport.
          expect(options.rootMargin).toContain("-20%");
        }
        observe(node: Element) {
          observed.push(node);
        }
        disconnect = disconnect;
      }
    );

    const about = document.createElement("section");
    about.id = "about";
    document.body.append(about);

    const { unmount } = renderHook(() => useActiveSection(ids));
    expect(observed).toHaveLength(1);
    expect(observed[0]).toBe(about);

    unmount();
    expect(disconnect).toHaveBeenCalled();
    about.remove();
  });
});
