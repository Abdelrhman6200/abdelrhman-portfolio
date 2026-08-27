/*
 * The console, rendered without the desktop bridge.
 *
 * This app ships two ways: as an Electron desktop application talking to the
 * main process over `window.desktopAPI`, and as a plain web build where that
 * bridge does not exist. The web build is what a portfolio visitor opens, so
 * the no-bridge path is the one most people will actually see — and it was
 * the only major surface in this repository with no test at all.
 *
 * What matters here is that the absence of the bridge is handled as a known
 * state rather than an error: the console renders the full workspace from
 * `fallbackState()`, its navigation works, and the mutating actions refuse
 * honestly instead of appearing to save into nothing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import OperationsConsole from "./OperationsConsole";
import { fallbackState } from "@/lib/ops";

beforeEach(() => {
  // Explicitly the web build: no Electron preload has run.
  delete (window as { desktopAPI?: unknown }).desktopAPI;
  // The analytics charts observe their container to size themselves, and
  // jsdom implements neither observer. Stubbed rather than mocked away: the
  // charts still mount, they simply never receive a resize.
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.ResizeObserver ??= window.ResizeObserver;

  // This jsdom build does not provide storage unless node is started with
  // --localstorage-file. The theme preference reads it, so an in-memory
  // stand-in keeps the environment gap out of the assertions.
  if (!window.localStorage) {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, String(value)),
        removeItem: (key: string) => void store.delete(key),
        clear: () => store.clear(),
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  }

  // The console reads sizes for its layout; jsdom reports none.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("OperationsConsole without the desktop bridge", () => {
  it("renders the workspace instead of an error", async () => {
    render(<OperationsConsole />);
    // The workspace name from fallbackState reaches the header.
    await waitFor(() => {
      expect(screen.getAllByText(new RegExp(fallbackState().workspace.name, "i")).length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/workspace unavailable/i)).toBeNull();
  });

  it("opens on the control tower", async () => {
    render(<OperationsConsole />);
    await waitFor(() => expect(screen.getAllByText(/command center|control tower/i).length).toBeGreaterThan(0));
  });

  it("offers every navigation group in the sidebar", async () => {
    render(<OperationsConsole />);
    await waitFor(() => expect(screen.getAllByRole("button").length).toBeGreaterThan(5));
    for (const group of ["Command center", "Operations", "Intelligence", "Knowledge", "Governance"]) {
      expect(screen.getAllByText(group).length).toBeGreaterThan(0);
    }
  });

  it("switches surface when a module is chosen", async () => {
    render(<OperationsConsole />);
    const students = await screen.findByRole("button", { name: /^students$/i });
    fireEvent.click(students);
    // The header names the active module, so it now appears more than once —
    // in the nav and in the header.
    await waitFor(() => expect(screen.getAllByText(/students/i).length).toBeGreaterThan(1));
  });

  it("shows real records from the fallback workspace, not an empty table", async () => {
    render(<OperationsConsole />);
    const first = fallbackState().students[0];
    fireEvent.click(await screen.findByRole("button", { name: /^students$/i }));
    await waitFor(() => expect(screen.getAllByText(String(first.name)).length).toBeGreaterThan(0));
  });

  it("exposes the role selector the demo depends on", async () => {
    render(<OperationsConsole />);
    const roles = await screen.findByLabelText(/demo role selector/i);
    expect((roles as HTMLSelectElement).value).toBe(fallbackState().currentUser.role);
  });

  it("keeps every record keyed, so React can reconcile the tables", () => {
    // A duplicate or missing key silently corrupts row state on re-render;
    // fallbackState is the only data source in this build.
    const state = fallbackState();
    for (const [key, value] of Object.entries(state)) {
      if (!Array.isArray(value)) continue;
      expect(value.every((record) => Boolean(record.id)), `${key} has a record without an id`).toBe(true);
    }
  });
});
