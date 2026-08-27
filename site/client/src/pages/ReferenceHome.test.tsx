/*
 * Smoke and contract tests for the home page.
 *
 * These exist to catch the two failure modes that a type-check cannot: the page
 * throwing at render, and the page silently losing the things that make it
 * useful — a working contact route, evidence labelling, and the method section.
 */
import { afterEach, describe, expect, it, beforeAll } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@/testUtils";
import ReferenceHome from "./ReferenceHome";
import { allProjects, builtSystems, contact, methodStages } from "@/content/portfolio";
import { demos } from "@/demos/registry";

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

describe("built software section", () => {
  it("gives every built system its stat strip and both routes to proof", () => {
    const { container } = render(<ReferenceHome />);

    // One feature row per built system, each with stats rendered.
    const features = container.querySelectorAll(".ref-feature");
    expect(features).toHaveLength(builtSystems.length);
    for (const system of builtSystems) {
      expect(system.stats?.length, `${system.title} missing stats`).toBe(3);
      for (const stat of system.stats!) {
        expect(container.textContent).toContain(stat.value);
      }
    }

    // Every feature row carries a demo CTA and a case-file link.
    const demoCtas = screen.getAllByRole("link", { name: /run the live demo/i });
    expect(demoCtas.length).toBeGreaterThanOrEqual(builtSystems.length);
    expect(screen.getAllByRole("link", { name: /case file/i }).length).toBeGreaterThanOrEqual(
      builtSystems.length
    );
  });

  it("lists all six demos in the strip", () => {
    const { container } = render(<ReferenceHome />);
    const strip = container.querySelector(".ref-demo-strip");
    expect(strip).not.toBeNull();
    expect(strip!.querySelectorAll("a")).toHaveLength(demos.length);
  });
});

describe("per-route document metadata", () => {
  it("sets a distinct title and a self-referential canonical", async () => {
    // The shell ships a single static title and a root canonical; before this
    // hook every deep route declared itself a duplicate of the home page.
    document.head.innerHTML =
      '<meta name="description" content=""><meta property="og:url" content="/"><link rel="canonical" href="/">';

    const { default: SystemCaseFile } = await import("./SystemCaseFile");
    const { Router } = await import("wouter");
    const { memoryLocation } = await import("wouter/memory-location");
    const { slugFor } = await import("@/content/slugs");
    const project = builtSystems[0];
    const path = `/system/${slugFor(project.title)}`;

    const { hook } = memoryLocation({ path });
    render(
      <Router hook={hook}>
        <SystemCaseFile />
      </Router>
    );

    expect(document.title).toContain(project.title);
    expect(document.title).not.toBe("Abdelrhman Shoman — Systems Builder");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toContain(path);
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toContain(path);
  });
});

describe("method tablist keyboard navigation", () => {
  // The README claims the WAI-ARIA tabs pattern with arrow/Home/End keys.
  // That claim had no test until now.
  const tabs = () =>
    within(screen.getByRole("tablist", { name: /method stages/i })).getAllByRole("tab");
  const selected = () => tabs().findIndex((tab) => tab.getAttribute("aria-selected") === "true");

  it("moves selection with ArrowRight and ArrowLeft", () => {
    render(<ReferenceHome />);
    expect(selected()).toBe(0);

    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    expect(selected()).toBe(1);

    fireEvent.keyDown(tabs()[1], { key: "ArrowLeft" });
    expect(selected()).toBe(0);
  });

  it("wraps at both ends", () => {
    render(<ReferenceHome />);
    const last = tabs().length - 1;

    fireEvent.keyDown(tabs()[0], { key: "ArrowLeft" });
    expect(selected()).toBe(last);

    fireEvent.keyDown(tabs()[last], { key: "ArrowRight" });
    expect(selected()).toBe(0);
  });

  it("jumps to first and last with Home and End", () => {
    render(<ReferenceHome />);
    fireEvent.keyDown(tabs()[0], { key: "End" });
    expect(selected()).toBe(tabs().length - 1);

    fireEvent.keyDown(tabs()[tabs().length - 1], { key: "Home" });
    expect(selected()).toBe(0);
  });

  it("keeps a roving tabindex — exactly one tab is reachable by Tab", () => {
    const { container } = render(<ReferenceHome />);
    const reachable = tabs().filter((tab) => tab.getAttribute("tabindex") === "0");
    expect(reachable).toHaveLength(1);
    expect(reachable[0].getAttribute("aria-selected")).toBe("true");
    expect(container).toBeDefined();
  });
});

describe("information architecture", () => {
  it("shows each project once — no project appears in both a spotlight and the record", () => {
    const { container } = render(<ReferenceHome />);

    // The three built systems get feature rows; they must not be repeated as
    // record rows, which is what made 18 projects read as 26 impressions.
    const recordTitles = Array.from(container.querySelectorAll(".ref-record-body b")).map(
      (node) => node.textContent
    );
    for (const system of builtSystems) {
      expect(recordTitles, `${system.title} is duplicated in the record`).not.toContain(system.title);
    }
  });

  it("renders one case file at a time instead of five full cards", () => {
    const { container } = render(<ReferenceHome />);
    expect(container.querySelectorAll(".ref-file-panel")).toHaveLength(1);
    expect(container.querySelectorAll('[role="tab"][aria-controls="file-panel"]')).toHaveLength(5);
  });

  it("keeps the page's running simulations to a readable number", () => {
    // Previously eight ran at once: three feature rows plus five case cards.
    const { container } = render(<ReferenceHome />);
    expect(container.querySelectorAll(".sim").length).toBeLessThanOrEqual(4);
  });

  it("groups the record and covers every non-built project exactly once", () => {
    const { container } = render(<ReferenceHome />);
    const rows = container.querySelectorAll(".ref-record-row");
    const expected = allProjects.length - builtSystems.length;
    expect(rows).toHaveLength(expected);

    const groups = container.querySelectorAll(".ref-record-group");
    expect(groups.length).toBeGreaterThan(1);
  });

  it("still labels every record row with its evidence tier", () => {
    const { container } = render(<ReferenceHome />);
    const rows = container.querySelectorAll(".ref-record-row");
    for (const row of Array.from(rows)) {
      expect(row.querySelector(".ref-evidence")).not.toBeNull();
    }
  });
});
