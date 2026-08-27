/*
 * Theme control.
 *
 * A single button cycling light → dark → system, rather than a two-state
 * switch, so "follow my OS" stays reachable after an explicit choice — a plain
 * toggle strands the visitor on a manual setting with no way back.
 *
 * The icon shows what is currently in effect; the accessible name says what
 * pressing it will do next, which is the part a screen-reader user needs.
 */
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/contexts/ThemeContext";

const nextInCycle: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const describe: Record<ThemePreference, string> = {
  light: "light",
  dark: "dark",
  system: "system",
};

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { preference, theme, cycleTheme, switchable } = useTheme();

  // Without a switchable provider there is nothing to control.
  if (!switchable) return null;

  const Icon = preference === "system" ? Monitor : theme === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={cycleTheme}
      aria-label={`Theme: ${describe[preference]}. Switch to ${describe[nextInCycle[preference]]}.`}
      title={`Theme: ${describe[preference]}`}
    >
      <Icon size={15} aria-hidden="true" />
      <span className="theme-toggle-text">{describe[preference]}</span>
    </button>
  );
}
