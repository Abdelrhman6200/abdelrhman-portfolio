/*
 * Every built system is linked from the home page, so every one must have a
 * reachable case file that renders.
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@/testUtils";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import SystemCaseFile, { slugFor } from "./SystemCaseFile";
import { builtSystems } from "@/content/portfolio";

beforeAll(() => {
  if (!("IntersectionObserver" in globalThis)) {
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "IntersectionObserver", {
      value: NoopObserver,
      writable: true,
    });
  }
});

afterEach(cleanup);

function renderAt(path: string) {
  const { hook } = memoryLocation({ path });
  return render(
    <Router hook={hook}>
      <SystemCaseFile />
    </Router>
  );
}

describe("slugFor", () => {
  it("produces url-safe, unique slugs for every built system", () => {
    const slugs = builtSystems.map((project) => slugFor(project.title));
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("SystemCaseFile", () => {
  it.each(builtSystems.map((project) => [project.title, project] as const))(
    "renders the case file for %s",
    (_title, project) => {
      renderAt(`/system/${slugFor(project.title)}`);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(project.title);
    }
  );

  it("lists the verifiable claims for a system that has them", () => {
    const project = builtSystems.find((item) => item.verifiable?.length);
    if (!project?.verifiable) throw new Error("expected at least one system with verifiable claims");

    const { container } = renderAt(`/system/${slugFor(project.title)}`);
    for (const fact of project.verifiable) {
      expect(container.textContent).toContain(fact);
    }
  });

  it("shows a not-found state for an unknown system", () => {
    renderAt("/system/does-not-exist");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/does not exist/i);
  });
});
