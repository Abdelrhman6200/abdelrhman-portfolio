/*
 * Four security modules are byte-identical across all three applications.
 *
 * The site used to say so on the home page. That panel is gone — file names
 * and line counts are trivia to the people the site is written for — but the
 * property is still worth enforcing: patching auth in one app and forgetting
 * the other two is a real bug, and a silent one.
 *
 * So this is now a drift guard rather than evidence for a claim. If someone
 * edits one app's auth core without the others, it fails.
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
