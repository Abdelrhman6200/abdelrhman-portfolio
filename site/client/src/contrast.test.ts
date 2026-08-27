/*
 * Contrast.
 *
 * Colour tokens are easy to adjust and easy to break: nudging a muted grey for
 * looks can quietly drop body text under the legibility threshold, and it is
 * invisible in review. So the tokens are read straight out of reference.css and
 * the ratios recomputed on every run — if someone edits a value, this fails.
 *
 * Thresholds are WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text
 * (>=24px, or >=18.66px bold) and for UI component boundaries.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "client", "src", "reference.css"), "utf8");

/** Reads a token's value from a named palette block. */
function token(selector: string, name: string): string {
  const start = css.indexOf(selector + " {");
  if (start < 0) throw new Error(`palette not found: ${selector}`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`${name} not declared in ${selector}`);
  return match[1].trim();
}

type Rgb = [number, number, number];

function parseHex(value: string): Rgb {
  const raw = value.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

/** Composite a translucent foreground over an opaque background. */
function over(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT = ".reference-page";
const DARK = ":root.dark .reference-page";
const t = (palette: string, name: string) => parseHex(token(palette, name));

/** The panel ink is stable across themes; read it once from the light palette. */
const PANEL_INK = t(LIGHT, "--ref-on-dark");

const cases: Array<[string, Rgb, Rgb, number]> = [
  // Light theme.
  ["light: body text on page", t(LIGHT, "--ref-ink"), t(LIGHT, "--ref-bg"), 4.5],
  ["light: body copy on card", t(LIGHT, "--ref-body"), t(LIGHT, "--ref-card"), 4.5],
  ["light: muted on page", t(LIGHT, "--ref-muted"), t(LIGHT, "--ref-bg"), 4.5],
  ["light: muted on card", t(LIGHT, "--ref-muted"), t(LIGHT, "--ref-card"), 4.5],
  ["light: coral ink on page", t(LIGHT, "--ref-coral-ink"), t(LIGHT, "--ref-bg"), 4.5],
  ["light: coral ink on card", t(LIGHT, "--ref-coral-ink"), t(LIGHT, "--ref-card"), 4.5],
  // Display-size only, so the 3:1 large-text threshold applies.
  ["light: brand coral heading", t(LIGHT, "--ref-coral"), t(LIGHT, "--ref-bg"), 3],
  ["light: panel ink on panel", PANEL_INK, t(LIGHT, "--ref-panel"), 4.5],
  ["light: panel ink 57% on panel", over(PANEL_INK, 0.57, t(LIGHT, "--ref-panel")), t(LIGHT, "--ref-panel"), 4.5],

  // Dark theme.
  ["dark: body text on page", t(DARK, "--ref-ink"), t(DARK, "--ref-bg"), 4.5],
  ["dark: body copy on card", t(DARK, "--ref-body"), t(DARK, "--ref-card"), 4.5],
  ["dark: muted on page", t(DARK, "--ref-muted"), t(DARK, "--ref-bg"), 4.5],
  ["dark: muted on card", t(DARK, "--ref-muted"), t(DARK, "--ref-card"), 4.5],
  ["dark: coral ink on page", t(DARK, "--ref-coral-ink"), t(DARK, "--ref-bg"), 4.5],
  ["dark: coral ink on card", t(DARK, "--ref-coral-ink"), t(DARK, "--ref-card"), 4.5],
  ["dark: yellow on panel", t(DARK, "--ref-yellow"), t(DARK, "--ref-panel"), 4.5],
  ["dark: panel ink on panel", PANEL_INK, t(DARK, "--ref-panel"), 4.5],
  ["dark: panel ink 57% on panel", over(PANEL_INK, 0.57, t(DARK, "--ref-panel")), t(DARK, "--ref-panel"), 4.5],
  ["dark: panel ink 50% on soft panel", over(PANEL_INK, 0.5, t(DARK, "--ref-panel-soft")), t(DARK, "--ref-panel-soft"), 4.5],
  // Inverted chips read as emphasis; the pair must work in both directions.
  ["dark: chip ink on ink chip", t(DARK, "--ref-paper"), t(DARK, "--ref-ink"), 4.5],
  ["light: chip ink on ink chip", t(LIGHT, "--ref-paper"), t(LIGHT, "--ref-ink"), 4.5],

  // Pressed and active states. These are the pairings that broke first: when
  // --ref-white and --ref-ink resolved to the same colour, every one of these
  // rendered as a blank slab.
  ["light: button ink on ink fill", t(LIGHT, "--ref-white"), t(LIGHT, "--ref-ink"), 4.5],
  ["dark: button ink on ink fill", t(DARK, "--ref-white"), t(DARK, "--ref-ink"), 4.5],
  ["light: accent ink on coral fill", t(LIGHT, "--ref-on-accent"), t(LIGHT, "--ref-coral"), 4.5],
  ["dark: accent ink on coral fill", t(LIGHT, "--ref-on-accent"), t(DARK, "--ref-coral"), 4.5],
  ["light: accent ink on yellow chip", t(LIGHT, "--ref-on-accent"), t(LIGHT, "--ref-yellow"), 4.5],
  ["dark: accent ink on yellow chip", t(LIGHT, "--ref-on-accent"), t(DARK, "--ref-yellow"), 4.5],
  ["light: accent ink on orange fill", t(LIGHT, "--ref-on-accent"), t(LIGHT, "--ref-orange"), 4.5],
  ["dark: accent ink on orange fill", t(LIGHT, "--ref-on-accent"), t(DARK, "--ref-orange"), 4.5],
  // The active service tab sits on a permanently dark panel.
  ["light: active tab on panel", t(LIGHT, "--ref-panel"), PANEL_INK, 4.5],
  ["dark: active tab on panel", t(DARK, "--ref-panel"), PANEL_INK, 4.5],
];

describe("WCAG AA contrast", () => {
  it.each(cases)("%s", (_label, fg, bg, threshold) => {
    const value = ratio(fg, bg);
    expect(
      Number(value.toFixed(2)),
      `${value.toFixed(2)}:1 is below the required ${threshold}:1`
    ).toBeGreaterThanOrEqual(threshold);
  });
});
