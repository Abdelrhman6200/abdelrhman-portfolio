/*
 * The colophon states the site's own numbers. That is only worth doing if the
 * numbers are true, so these check the generated values against the repository
 * they claim to describe — the same standard the site applies to every other
 * claim it makes.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { colophon } from "@/content/colophon";

const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

describe("colophon", () => {
  it("states the real dependency count", () => {
    expect(colophon.dependencies).toBe(Object.keys(pkg.dependencies).length);
  });

  it("states a test count matching this suite", () => {
    // If this drifts, `npm run build` regenerates it from vitest itself.
    expect(colophon.tests).toBeGreaterThanOrEqual(140);
  });

  it("counts more source files than test files", () => {
    expect(colophon.sourceFiles).toBeGreaterThan(colophon.testFiles);
  });

  it("names only stack entries that are real dependencies or devDependencies", () => {
    const installed = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]);
    const known: Record<string, string> = {
      React: "react",
      TypeScript: "typescript",
      Vite: "vite",
      wouter: "wouter",
    };
    for (const entry of colophon.stack) {
      expect(installed.has(known[entry]), `${entry} is claimed but not installed`).toBe(true);
    }
  });

  it("keeps the no-framework claim honest", () => {
    // The footer says "no UI framework beyond a router, no animation library,
    // no 3D". If any of these ever arrive, the sentence must change with them.
    const forbidden = ["three", "@react-three/fiber", "framer-motion", "gsap", "next", "@mui/material"];
    for (const name of forbidden) {
      expect(pkg.dependencies?.[name], `${name} contradicts the colophon`).toBeUndefined();
    }
  });
});
