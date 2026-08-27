/*
 * Smoke and contract tests for the home page.
 *
 * These exist to catch the two failure modes that a type-check cannot: the page
 * throwing at render, and the page silently losing the things that make it
 * useful — a working contact route, evidence labelling, and the method section.
 */
import { afterEach, describe, expect, it, beforeAll } from "vitest";
import { cleanup, render, screen, within } from "@/testUtils";
import ReferenceHome from "./ReferenceHome";
import { allProjects, builtSystems, contact, methodStages } from "@/content/portfolio";

beforeAll(() => {
  // jsdom implements neither; the component only needs them not to throw.
  if (!("IntersectionObserver" in globalThis)) {
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "IntersectionObserver", { value: NoopObserver, writable: true });
  }
});

// `globals: false`, so testing-library's automatic cleanup is not registered.
afterEach(cleanup);

describe("ReferenceHome", () => {
  it("renders without throwing", () => {
    render(<ReferenceHome />);
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
  });

  it("exposes a real, reachable contact route", () => {
    render(<ReferenceHome />);
    const mailtoLinks = screen
      .getAllByRole("link")
      .filter((node) => node.getAttribute("href")?.startsWith(`mailto:${contact.email}`));

    // The primary CTA plus the contact card, at minimum.
    expect(mailtoLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("contains no placeholder contact details", () => {
    const { container } = render(<ReferenceHome />);
    expect(container.textContent).not.toMatch(/placeholder|example\.com/i);
  });

  it("renders the method section with every stage as a tab", () => {
    render(<ReferenceHome />);
    const tablist = screen.getByRole("tablist", { name: /method stages/i });
    expect(within(tablist).getAllByRole("tab")).toHaveLength(methodStages.length);
  });

  it("shows exactly one selected method stage at a time", () => {
    render(<ReferenceHome />);
    const selected = screen
      .getByRole("tablist", { name: /method stages/i })
      .querySelectorAll('[aria-selected="true"]');
    expect(selected).toHaveLength(1);
  });

  it("labels every project in the index with an evidence tier", () => {
    const { container } = render(<ReferenceHome />);
    const badges = container.querySelectorAll(".ref-evidence");
    // Index cards, built-software cards and case-file cards each carry one.
    expect(badges.length).toBeGreaterThanOrEqual(allProjects.length);
  });

  it("presents built software with verifiable claims attached", () => {
    render(<ReferenceHome />);
    for (const system of builtSystems) {
      expect(screen.getAllByText(system.title).length).toBeGreaterThan(0);
    }
  });

  it("gives every in-page nav target a matching section", () => {
    const { container } = render(<ReferenceHome />);
    const anchors = Array.from(container.querySelectorAll('a[href^="#"]'))
      .map((node) => node.getAttribute("href")!.slice(1))
      .filter((id) => id && id !== "main");

    for (const id of Array.from(new Set(anchors))) {
      expect(container.querySelector(`#${id}`), `no element with id "${id}"`).not.toBeNull();
    }
  });
});

describe("portfolio content", () => {
  it("never states a bare metric on an unverified project", () => {
    // Reported figures must be attributed, so a reader is never asked to take
    // a number on trust without being told where it came from.
    for (const project of allProjects) {
      if (project.evidence === "brief" && project.result && /\d/.test(project.result)) {
        expect(project.result, `${project.title} states a figure unattributed`).toMatch(/Reported:/);
      }
    }
  });

  it("only attaches verifiable claims to projects with readable source", () => {
    for (const project of allProjects) {
      if (project.verifiable) expect(project.evidence).toBe("code");
    }
  });

  it("uses unique project numbers", () => {
    const numbers = allProjects.map((project) => project.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
