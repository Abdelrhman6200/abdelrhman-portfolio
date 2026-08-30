/*
 * Theme invariants.
 *
 * Dark mode here works by redefining tokens, not by rewriting rules — which
 * only holds if the token contract holds. These tests catch the two ways it
 * silently breaks: a token used but never declared (renders as nothing), and a
 * token declared for light but forgotten for dark (renders as the light value
 * on a dark ground).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cssDir = join(process.cwd(), "client", "src");
const reference = readFileSync(join(cssDir, "reference.css"), "utf8");

/** Token names declared inside one `{ … }` block, found by its selector. */
function declaredIn(css: string, selector: string, prefix: string): Set<string> {
  const start = css.indexOf(selector + " {");
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const end = css.indexOf("\n}", start);
  const block = css.slice(start, end);
  const names = block.match(new RegExp(`^\\s*(${prefix}[a-z0-9-]*)\\s*:`, "gm")) ?? [];
  return new Set(names.map((line) => line.trim().replace(/\s*:$/, "")));
}

const light = declaredIn(reference, ".reference-page", "--ref-");
const dark = declaredIn(reference, ":root.dark .reference-page", "--ref-");

/**
 * Tokens intentionally identical in both themes.
 *
 * `--ref-on-dark*` is light ink for the panels that stay dark whichever theme
 * is active — if it inverted, the services band, the proof band and the case
 * inspector would all render dark-on-dark.
 *
 * `--ref-on-accent` is dark ink for the saturated coral/orange/yellow fills,
 * which sit light on the luminance scale in both themes and so always need
 * dark text on them.
 */
const STABLE = new Set(["--ref-on-dark", "--ref-on-dark-rgb", "--ref-on-accent"]);

describe("reference.css theme tokens", () => {
  it("declares a light palette and a dark palette", () => {
    expect(light.size).toBeGreaterThan(15);
    expect(dark.size).toBeGreaterThan(15);
  });

  it("overrides every light token in dark, except the deliberately stable ones", () => {
    const missing = Array.from(light).filter((token) => !dark.has(token) && !STABLE.has(token));
    expect(missing, `not overridden for dark: ${missing.join(", ")}`).toEqual([]);
  });

  it("keeps the stable panel-ink tokens out of the dark palette", () => {
    for (const token of Array.from(STABLE)) {
      expect(dark.has(token), `${token} must not be redefined for dark`).toBe(false);
    }
  });

  it("declares every token it uses", () => {
    const used = new Set(
      (reference.match(/var\((--ref-[a-z0-9-]*)/g) ?? []).map((m) => m.replace("var(", ""))
    );
    const undeclared = Array.from(used).filter((token) => !light.has(token));
    expect(undeclared, `used but never declared: ${undeclared.join(", ")}`).toEqual([]);
  });

  it("routes translucent panel ink through the stable channel", () => {
    // Every one of these sits on a permanently dark panel, so none may use the
    // inverting paper channel.
    expect(reference).not.toMatch(/rgba\(var\(--ref-paper-rgb\)/);
  });

  /*
   * Element defaults must not outrank component classes.
   *
   * `.reference-page a` and `.reference-page button` are (0,1,1) selectors.
   * Every component rule below them — `.reference-menu`, `.ref-button-accent`,
   * `.skip-link` — is (0,1,0), so `color: inherit` and `font: inherit` beat
   * the colour and type those rules name, and beat them silently: the page
   * still renders, just in the inherited ink. That shipped a cream hamburger
   * on a cream circle and a 2.33:1 primary CTA. Wrapped in `:where()` the
   * defaults carry zero specificity and anything with a class wins.
   */
  it("keeps the link and button defaults at zero specificity", () => {
    const raw = reference.match(/(?:^|[,}])\s*\.reference-page\s+(?:a|button)\s*[,{]/gm) ?? [];
    expect(raw, `must be wrapped in :where() — found: ${raw.join(", ")}`).toEqual([]);
    expect(reference).toMatch(/:where\(\.reference-page\) a\s*\{/);
    expect(reference).toMatch(/:where\(\.reference-page\) button\s*\{/);
  });

  it("leaves no raw colour outside the two palette blocks", () => {
    // Strip both palette declaration blocks, then look for literal colours.
    const withoutPalettes = reference
      .replace(/\.reference-page \{[\s\S]*?\n\}/, "")
      .replace(/:root\.dark \.reference-page \{[\s\S]*?\n\}/, "");

    const literals = withoutPalettes.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    expect(literals, `hardcoded colours: ${literals.join(", ")}`).toEqual([]);
  });
});

