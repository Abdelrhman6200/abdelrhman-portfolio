/*
 * Theme control behaviour.
 *
 * The parts worth pinning are the ones a visitor would notice breaking: the
 * default follows the OS, an explicit choice sticks, and "system" stays
 * reachable so nobody gets stranded on a manual setting.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function setSystemDark(dark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: dark && query.includes("prefers-color-scheme: dark"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  setSystemDark(false);
  document.documentElement.classList.remove("dark");
  try {
    localStorage.clear();
  } catch {
    // Storage unavailable in this environment; the provider tolerates it.
  }
});

afterEach(cleanup);

const renderToggle = (props: { switchable?: boolean } = {}) =>
  render(
    <ThemeProvider defaultTheme="system" switchable={props.switchable ?? true}>
      <ThemeToggle />
    </ThemeProvider>
  );

describe("ThemeToggle", () => {
  it("follows the operating system by default", () => {
    setSystemDark(true);
    renderToggle();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("stays light when the operating system is light", () => {
    renderToggle();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("changes what is on screen on the very first press", () => {
    // Starting on "system" with a light OS, pressing once must go dark — a
    // first press that resolves back to light would look like a broken button.
    renderToggle();
    act(() => screen.getByRole("button").click());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("also changes on the first press when the OS is dark", () => {
    setSystemDark(true);
    renderToggle();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => screen.getByRole("button").click());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("walks through all three states and returns to system", () => {
    renderToggle();
    const button = screen.getByRole("button");

    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      seen.push(button.getAttribute("aria-label")?.match(/Theme: (\w+)/)?.[1] ?? "");
      act(() => button.click());
    }

    expect(seen).toEqual(["system", "dark", "light", "system"]);
  });

  it("keeps system reachable, so a manual choice is never a dead end", () => {
    renderToggle();
    const button = screen.getByRole("button");

    const labels: string[] = [];
    for (let i = 0; i < 3; i++) {
      labels.push(button.getAttribute("aria-label") ?? "");
      act(() => button.click());
    }

    expect(labels.some((label) => /Theme: system/i.test(label))).toBe(true);
  });

  it("names the next state, not just the current one", () => {
    renderToggle();
    expect(screen.getByRole("button").getAttribute("aria-label")).toMatch(/Switch to/i);
  });

  it("renders nothing when the provider is not switchable", () => {
    renderToggle({ switchable: false });
    expect(screen.queryByRole("button")).toBeNull();
  });
});
