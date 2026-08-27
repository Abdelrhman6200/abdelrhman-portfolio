/*
 * Demo surface tests.
 *
 * Every demo is linked from project cards, so every one must mount, and the
 * registry must stay aligned with the project catalogue. The feedback demo
 * additionally gets an interaction test, because the role gate is the claim
 * that whole demo exists to make.
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@/testUtils";
import { allProjects } from "@/content/portfolio";
import { demoPathFor, demos } from "./registry";
import FeedbackDemo from "./FeedbackDemo";
import ValidationDemo from "./ValidationDemo";

beforeAll(() => {
  if (!("IntersectionObserver" in globalThis)) {
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "IntersectionObserver", { value: NoopObserver, writable: true });
  }
});

afterEach(cleanup);

describe("demo registry", () => {
  it("points every demo at real project kinds", () => {
    const kinds = new Set(allProjects.map((project) => project.kind));
    for (const demo of demos) {
      for (const kind of demo.kinds) {
        expect(kinds.has(kind), `${demo.slug} references unknown kind "${kind}"`).toBe(true);
      }
    }
  });

  it("gives all three built systems a demo", () => {
    for (const kind of ["feedback", "ops-intelligence", "success"]) {
      expect(demoPathFor(kind), kind).not.toBeNull();
    }
  });

  it("uses unique slugs", () => {
    const slugs = demos.map((demo) => demo.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe.each(demos.map((demo) => [demo.title, demo] as const))("%s demo", (_title, demo) => {
  it("mounts with the honesty banner and a way back", () => {
    const Demo = demo.component;
    render(<Demo />);
    expect(screen.getByText(/RUNS ENTIRELY IN YOUR BROWSER/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /back to the work/i })).toBeDefined();
  });
});

describe("feedback demo role gate", () => {
  it("lets the teacher generate, blocks the coordinator from editing, and gates approval", () => {
    render(<FeedbackDemo />);

    // Teacher generates a draft.
    act(() => {
      screen.getByRole("button", { name: /generate from evidence/i }).click();
    });
    expect(screen.getAllByText(/Mariam/).length).toBeGreaterThan(0);

    // Switch to coordinator: the draft textareas go dead.
    act(() => {
      screen.getByRole("button", { name: "coordinator" }).click();
    });
    const strengths = screen.getByLabelText("STRENGTHS") as HTMLTextAreaElement;
    expect(strengths.disabled).toBe(true);
    // And there is nothing to approve yet.
    expect(screen.queryByRole("button", { name: /^Approve$/i })).toBeNull();

    // Back to teacher, submit; then the coordinator can approve.
    act(() => {
      screen.getByRole("button", { name: "teacher" }).click();
    });
    act(() => {
      screen.getByRole("button", { name: /submit for review/i }).click();
    });
    act(() => {
      screen.getByRole("button", { name: "coordinator" }).click();
    });
    act(() => {
      screen.getByRole("button", { name: /^Approve$/i }).click();
    });
    expect(screen.getByText("APPROVED")).toBeDefined();
  });
});

describe("validation demo", () => {
  it("clears an exception when the visitor fixes the cell", () => {
    render(<ValidationDemo />);

    // The seeded sheet has a malformed ID on row 4 ("1044").
    const cell = screen.getByLabelText("STUDENT ID, row 4") as HTMLInputElement;
    expect(cell.value).toBe("1044");
    const before = screen.getAllByText(/id-format/).length;
    expect(before).toBeGreaterThan(0);

    act(() => {
      fireEvent.change(cell, { target: { value: "ST-1044" } });
    });

    expect(screen.queryAllByText(/id-format/)).toHaveLength(0);
  });
});
