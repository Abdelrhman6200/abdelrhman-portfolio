/*
 * Fails if any source line carries too much code to read.
 *
 * The portfolio's strongest claim is its `code` evidence tier — "source you
 * can read". That claim is checkable, so this checks it. Before the first
 * run, three apps carried lines of 4,673, 10,381 and 10,404 characters:
 * whole components packed onto a single line, which nobody can read and
 * which made the claim untrue.
 *
 * It measures CODE on a line, not raw length. String literals are collapsed
 * to a placeholder first, because a long Tailwind class list is one value —
 * scannable, and unsplittable by any formatter — while a long line of packed
 * JSX is a wall. Counting raw characters would flag the vendored shadcn
 * components for something that is not a readability problem, and would let
 * a 219-character packed line pass for something that is.
 *
 * Plain node, no dependencies, so CI can run it without installing anything.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Every package, and the directories in each that hold hand-written source. */
const PACKAGES = [
  "site",
  "projects/feedback-copilot",
  "projects/community-success-os",
  "projects/edtech-ops-intelligence-os",
];
const SOURCE_DIRS = ["client/src", "server", "electron", "shared", "scripts"];
const EXTENSIONS = [".ts", ".tsx", ".mjs", ".cjs", ".js", ".jsx"];

/** Generated, vendored or built: not hand-written, so not ours to hold to this. */
const SKIP = [/node_modules/, /[\\/]dist[\\/]/, /\.d\.ts$/, /\.d\.mts$/];

const LIMIT = 220;

/**
 * Replace every string literal, template literal and comment body with a short
 * placeholder, so what remains is the code structure on that line.
 */
function codeOnly(line) {
  return line
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/\/\*.*?\*\//g, "/**/")
    .replace(/\/\/.*$/, "//");
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return; // Not every package has every source directory.
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (SKIP.some((pattern) => pattern.test(full))) continue;
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXTENSIONS.some((extension) => entry.endsWith(extension))) yield full;
  }
}

const offenders = [];
let scanned = 0;
let worst = { length: 0, at: "—" };

for (const pkg of PACKAGES) {
  for (const dir of SOURCE_DIRS) {
    for (const file of walk(join(root, pkg, dir))) {
      scanned += 1;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          const length = codeOnly(line).length;
          const at = `${relative(root, file).replaceAll("\\", "/")}:${index + 1}`;
          if (length > worst.length) worst = { length, at };
          if (length > LIMIT) offenders.push({ at, length });
        });
    }
  }
}

console.log(`readability: ${scanned} source files scanned, limit ${LIMIT} chars of code per line`);
console.log(`  longest: ${worst.length} chars of code — ${worst.at}`);

if (offenders.length > 0) {
  console.error(`\n${offenders.length} line(s) over the limit:`);
  for (const offender of offenders.slice(0, 30)) {
    console.error(`  ${offender.at} — ${offender.length} chars of code`);
  }
  if (offenders.length > 30) console.error(`  …and ${offenders.length - 30} more`);
  console.error("\nRun that package's `npm run format` on the file, or break the line up by hand.");
  process.exit(1);
}

console.log("  all clear");
