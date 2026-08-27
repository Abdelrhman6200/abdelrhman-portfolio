/*
 * The mark, and the promise that there is only one of it.
 *
 * The geometry is written twice: in Logo.tsx, which draws it in the page, and
 * in scripts/logo.mjs, which renders the favicon, the touch icon and the
 * social cards. Two copies drift, and the failure is quiet — the tab shows
 * one shape and the header another, and nobody notices because nobody looks
 * at both at once. So the copies are compared here.
 *
 * scripts/logo.mjs is read as text rather than imported: importing it would
 * execute it, writing PNGs through sharp, which is an optional dependency CI
 * deliberately does not install.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Logo, { LOGO_PATH, LOGO_STROKE, LOGO_TERMINAL } from "./Logo";

const generator = readFileSync(join(process.cwd(), "scripts", "logo.mjs"), "utf8");

afterEach(cleanup);

describe("the mark is stated once", () => {
  it("draws the same path in the page as in the generated assets", () => {
    expect(generator).toContain(`export const LOGO_PATH = "${LOGO_PATH}";`);
  });

  it("uses the same stroke weight in both", () => {
    expect(generator).toContain(`export const LOGO_STROKE = ${LOGO_STROKE};`);
  });

  it("puts the terminal in the same place in both", () => {
    const { cx, cy, r } = LOGO_TERMINAL;
    expect(generator).toContain(`export const LOGO_TERMINAL = { cx: ${cx}, cy: ${cy}, r: ${r} };`);
  });

  it("is the only thing that writes the icon files", () => {
    // og.mjs used to render its own "AS" text mark for the favicon and touch
    // icon, which is exactly how two versions of an identity come to exist.
    const og = readFileSync(join(process.cwd(), "scripts", "og.mjs"), "utf8");
    expect(og).not.toMatch(/apple-touch-icon\.png"[^)]*\)\s*\.png\(\)/);
    expect(og).toContain('from "./logo.mjs"');
  });
});

describe("Logo", () => {
  it("is decorative beside the wordmark it already sits next to", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("names itself when it stands alone", () => {
    render(<Logo title="Abdelrhman Shoman" />);
    const svg = screen.getByRole("img", { name: "Abdelrhman Shoman" });
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });

  it("takes its ink from whatever it sits on", () => {
    // One colour, inherited: the mark has to work on paper, on the dark
    // sections, and on the coral plate without three versions of itself.
    const { container } = render(<Logo />);
    expect(container.querySelector("path")?.getAttribute("stroke")).toBe("currentColor");
  });

  it("scales from the tab to the page without redrawing", () => {
    const { container } = render(<Logo size={180} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("180");
    // A fixed viewBox is what lets one path serve 16px and 180px.
    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 100");
  });

  it("stays out of the tab order", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")?.getAttribute("focusable")).toBe("false");
  });
});
