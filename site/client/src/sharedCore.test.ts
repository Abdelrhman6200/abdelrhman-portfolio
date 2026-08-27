/*
 * The site claims four security modules are byte-identical across all three
 * applications. That is the strongest claim on the page — it is checkable with
 * a checksum — so it must not be allowed to quietly become false.
 *
 * If someone edits one app's auth core without the others, this fails.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sharedCore } from "@/content/portfolio";

const APPS = ["feedback-copilot", "community-success-os", "edtech-ops-intelligence-os"];
const projects = join(process.cwd(), "..", "projects");

const pathFor = (app: string, file: string) => join(projects, app, "server", "_core", file);
const digest = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

// The apps live beside the site in the bundle; skip if the site is checked out
// on its own rather than failing for the wrong reason.
const bundled = existsSync(join(projects, APPS[0]));
const when = bundled ? describe : describe.skip;

when("shared application core", () => {
  it("covers exactly the apps the claim names", () => {
    expect(APPS).toHaveLength(sharedCore.appCount);
  });

  it.each(sharedCore.files)("%s is byte-identical across all three apps", (file) => {
    const digests = APPS.map((app) => digest(pathFor(app, file)));
    expect(new Set(digests).size, `${file} differs between apps`).toBe(1);
  });

  it("states the real line count", () => {
    const total = sharedCore.files
      .map((file) => readFileSync(pathFor(APPS[0], file), "utf8").split("\n").length)
      .reduce((sum, lines) => sum + lines, 0);
    // Trailing-newline handling makes an exact match brittle; keep it honest
    // to within a line per file.
    expect(Math.abs(total - sharedCore.lines)).toBeLessThanOrEqual(sharedCore.files.length);
  });
});
