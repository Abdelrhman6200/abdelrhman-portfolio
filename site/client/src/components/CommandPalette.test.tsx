/*
 * The palette is navigation, so the things worth pinning are: it opens from
 * the keyboard, it finds what the reader types, it is operable without a
 * mouse, and it announces itself correctly. The item list is derived from the
 * content modules, so these assert against real content rather than fixtures —
 * a demo removed from the registry breaks the matching test, which is the
 * point of deriving it.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import CommandPalette, { openCommandPalette } from "./CommandPalette";
import { builtSystems } from "@/content/portfolio";
import { demos } from "@/demos/registry";

/** The global hotkey, as the browser delivers it. */
function pressHotkey() {
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
}

function input(): HTMLInputElement {
  return screen.getByRole("combobox") as HTMLInputElement;
}

function type(value: string) {
  fireEvent.change(input(), { target: { value } });
}

function optionTexts(): string[] {
  return screen.queryAllByRole("option").map((node) => node.textContent ?? "");
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
  render(<CommandPalette />);
});

afterEach(cleanup);

describe("CommandPalette", () => {
  it("stays out of the document until it is asked for", () => {
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on Ctrl/Cmd+K and closes on a second press", () => {
    pressHotkey();
    expect(screen.getByRole("dialog", { name: "Jump to" })).toBeTruthy();
    pressHotkey();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on a bare slash, the reflex on any searchable site", () => {
    fireEvent.keyDown(window, { key: "/" });
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("ignores a slash typed into its own field, so the query can contain one", () => {
    pressHotkey();
    type("a");
    fireEvent.keyDown(input(), { key: "/" });
    // Still open, and the press did not re-enter the open path.
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("opens when a header button asks for it", () => {
    act(() => openCommandPalette());
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("focuses the input so the reader can type immediately", () => {
    pressHotkey();
    expect(document.activeElement).toBe(input());
  });

  it("lists every shipped system and every demo", () => {
    pressHotkey();
    const options = optionTexts();
    for (const system of builtSystems) {
      expect(options.some((text) => text.includes(system.title))).toBe(true);
    }
    for (const demo of demos) {
      expect(options.some((text) => text.includes(`${demo.title} demo`))).toBe(true);
    }
  });

  it("filters on every term typed, not just the first", () => {
    pressHotkey();
    type("feedback demo");
    const options = screen.queryAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain("Feedback Copilot demo");
  });

  it("says so plainly when nothing matches", () => {
    pressHotkey();
    type("zzzznotathing");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/nothing matches/i)).toBeTruthy();
  });

  it("moves the selection with the arrow keys and wraps at the ends", () => {
    pressHotkey();
    expect(screen.queryAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(screen.queryAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");

    // Up past the first row wraps to the last rather than sticking.
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    const all = screen.queryAllByRole("option");
    expect(all[all.length - 1].getAttribute("aria-selected")).toBe("true");
  });

  it("points aria-activedescendant at the highlighted row", () => {
    pressHotkey();
    expect(input().getAttribute("aria-activedescendant")).toBe(screen.queryAllByRole("option")[0].id);

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(input().getAttribute("aria-activedescendant")).toBe(screen.queryAllByRole("option")[1].id);
  });

  it("resets the highlight when the query changes", () => {
    pressHotkey();
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    type("demo");
    expect(screen.queryAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
  });

  it("closes on Escape without navigating", () => {
    pressHotkey();
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(window.location.pathname).toBe("/");
  });

  it("closes when the backdrop is clicked but not when the panel is", () => {
    pressHotkey();
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeNull();

    const backdrop = document.querySelector(".cmdk-backdrop");
    expect(backdrop).not.toBeNull();
    fireEvent.mouseDown(backdrop!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("navigates on Enter and closes behind itself", () => {
    pressHotkey();
    type("feedback demo");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(window.location.pathname).toBe("/demo/feedback");
  });

  it("sends a case file to its own route", () => {
    pressHotkey();
    type(builtSystems[0].title);
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(window.location.pathname).toMatch(/^\/system\//);
  });

  it("marks itself as a modal dialog for assistive technology", () => {
    pressHotkey();
    expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
    expect(screen.getByRole("listbox", { name: "Destinations" })).toBeTruthy();
  });
});
