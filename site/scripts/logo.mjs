/*
 * The mark, as every file that needs to be a file.
 *
 * "The return": an S drawn as routing — the path leaves, turns twice, and
 * comes back on itself. A letter and a diagram of the same idea at once.
 *
 * The geometry is stated once here and once in client/src/components/Logo.tsx
 * (which draws it in the page), and a test compares the two: a mark that
 * drifts between the browser tab and the header is worse than no mark.
 *
 * Writes favicon.svg, favicon-96.png and apple-touch-icon.png. Run
 * `npm run logo` after changing the geometry; the outputs are committed, so
 * neither the build nor CI needs sharp.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public");

/** Must match LOGO_PATH in client/src/components/Logo.tsx. */
export const LOGO_PATH = "M72 26 L34 26 L34 50 L66 50 L66 74 L28 74 M28 74 L28 62";
export const LOGO_TERMINAL = { cx: 72, cy: 26, r: 10 };
export const LOGO_STROKE = 10;

const CORAL = "#ff6a52";
const PAPER = "#fffdf9";
const DARK = "#121213";

/**
 * The mark on a ground. `pad` insets the 100-unit artwork so the shape has
 * air inside a rounded tile — a mark that touches its own edge reads as
 * cropped at favicon size.
 */
function mark({ ground, ink, accent, radius = 0, size = 100, pad = 0 }) {
  const scale = (100 - pad * 2) / 100;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${ground ? `<rect width="100" height="100" rx="${radius}" fill="${ground}"/>` : ""}
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <path d="${LOGO_PATH}" fill="none" stroke="${ink}" stroke-width="${LOGO_STROKE}"
          stroke-linecap="butt" stroke-linejoin="miter"/>
    <circle cx="${LOGO_TERMINAL.cx}" cy="${LOGO_TERMINAL.cy}" r="${LOGO_TERMINAL.r}" fill="${accent}"/>
  </g>
</svg>`;
}

await mkdir(publicDir, { recursive: true });

/* The tab icon. Dark tile so the mark holds against a light browser chrome
 * and against a dark one — a transparent favicon disappears on one of them. */
const favicon = mark({ ground: DARK, ink: PAPER, accent: CORAL, radius: 18, pad: 6 });
await writeFile(join(publicDir, "favicon.svg"), `${favicon}\n`, "utf8");
console.log("wrote favicon.svg");

/* PNG fallbacks: older Safari and some feed readers ignore an SVG favicon,
 * and the touch icon is always a PNG. Same tile, same geometry. */
for (const [name, size, radius] of [
  ["favicon-96.png", 96, 18],
  ["apple-touch-icon.png", 180, 22],
]) {
  const svg = mark({ ground: DARK, ink: PAPER, accent: CORAL, radius, size, pad: 6 });
  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, name));
  console.log(`wrote ${name} — ${size}x${size}`);
}
