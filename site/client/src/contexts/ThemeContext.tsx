/*
 * Theme state.
 *
 * Three-way preference: "light", "dark", or "system". The default is "system",
 * so a visitor whose OS is set to dark gets a dark page without touching
 * anything; choosing explicitly pins it and persists.
 *
 * The resolved theme is written to `document.documentElement` as a `dark`
 * class, which is what every stylesheet keys off. The same decision is made
 * before first paint by the inline boot script in index.html — this provider
 * only has to keep it in sync afterwards.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeContextType {
  /** What the visitor chose, including "system". */
  preference: ThemePreference;
  /** What is actually on screen. */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Cycles light → dark → system. */
  cycleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function readStoredPreference(fallback: ThemePreference): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Storage unavailable (private mode, blocked cookies). Fall through.
  }
  return fallback;
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = false,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    switchable ? readStoredPreference(defaultTheme) : defaultTheme
  );
  const [resolvedSystem, setResolvedSystem] = useState<ResolvedTheme>(systemTheme);

  // Track the OS setting so "system" follows it live, not only on load.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setResolvedSystem(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const theme: ResolvedTheme = preference === "system" ? resolvedSystem : preference;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      if (!switchable) return;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage unavailable; the choice still applies for this session.
      }
    },
    [switchable]
  );

  /**
   * Cycles through all three states, ordered so the first press always changes
   * what is on screen.
   *
   * A fixed light → dark → system order looks broken when the OS is light: the
   * visitor starts on "system", presses once, and nothing appears to happen
   * because "system" already resolved to light. So leaving "system" always
   * jumps to the opposite of what is currently showing, and the remaining two
   * presses walk back through the other explicit choice to "system".
   *
   *   OS light:  system -> dark  -> light -> system
   *   OS dark:   system -> light -> dark  -> system
   */
  const cycleTheme = useCallback(() => {
    const opposite: ResolvedTheme = resolvedSystem === "dark" ? "light" : "dark";

    let next: ThemePreference;
    if (preference === "system") next = opposite;
    else if (preference === opposite) next = resolvedSystem;
    else next = "system";

    setPreference(next);
  }, [preference, resolvedSystem, setPreference]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, cycleTheme, switchable }),
    [preference, theme, setPreference, cycleTheme, switchable]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
