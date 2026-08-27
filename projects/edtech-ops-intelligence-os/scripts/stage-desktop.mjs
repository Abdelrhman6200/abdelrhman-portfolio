/*
 * Stages the packaged desktop app.
 *
 * electron-builder is pointed at `desktop-app/` (see desktop:package:win), and
 * that directory's package.json declares `files: ["dist/**\/*", "electron/**\/*"]`
 * with `main: "electron/main.cjs"`. main.cjs loads `../dist/public/index.html`
 * relative to itself, so the staged layout has to mirror the repo root:
 *
 *   desktop-app/
 *     electron/          <- copy of ./electron
 *     dist/public/       <- copy of ./dist/public (the built renderer)
 *
 * Staging is a clean copy every run: the previous contents are removed first so
 * a deleted source file cannot survive in the package. This script is what kept
 * the two electron/ directories in sync; without it they silently drift.
 */
import { cp, mkdir, rm, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stage = join(root, "desktop-app");

const renderer = join(root, "dist", "public");
try {
  await access(renderer);
} catch {
  console.error(
    "No built renderer at dist/public. Run `npm run desktop:build` before staging."
  );
  process.exit(1);
}

for (const dir of ["electron", "dist"]) {
  await rm(join(stage, dir), { recursive: true, force: true });
}

await mkdir(join(stage, "dist"), { recursive: true });
await cp(join(root, "electron"), join(stage, "electron"), { recursive: true });
await cp(renderer, join(stage, "dist", "public"), { recursive: true });

console.log("Staged desktop-app/ from electron/ and dist/public/.");
