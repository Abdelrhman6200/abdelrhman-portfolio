/*
 * Renders the social preview card (client/public/og.png, 1200x630).
 *
 * Run `npm run og` after changing it; the PNG is committed, so the build and
 * the deploy need neither sharp nor this script. The design mirrors the site:
 * dark ground, the claim in display type, coral signal, the evidence strip.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOGO_PATH, LOGO_STROKE, LOGO_TERMINAL } from "./logo.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public", "og.png");

/** The mark, placed on a card. One geometry, stated once, used everywhere. */
const brandMark = (x, y, scale, ink, accent) => `
  <g transform="translate(${x},${y}) scale(${scale})">
    <path d="${LOGO_PATH}" fill="none" stroke="${ink}" stroke-width="${LOGO_STROKE}"
          stroke-linecap="butt" stroke-linejoin="miter"/>
    <circle cx="${LOGO_TERMINAL.cx}" cy="${LOGO_TERMINAL.cy}" r="${LOGO_TERMINAL.r}" fill="${accent}"/>
  </g>`;

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#121213"/>

  <!-- the loop, faint, as structure -->
  <g fill="none" stroke="#2b2b2f" stroke-width="2">
    <circle cx="1100" cy="90" r="210"/>
    <circle cx="1100" cy="90" r="140"/>
  </g>
  ${brandMark(1030, 22, 1.38, "#ece9e3", "#ff6a52")}

  <text x="90" y="150" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="#8d8880" letter-spacing="6">ABDELRHMAN SHOMAN — SYSTEMS BUILDER</text>

  <text x="82" y="300" font-family="Arial, sans-serif" font-size="128" font-weight="800" fill="#ece9e3" letter-spacing="-5">I build</text>
  <text x="82" y="430" font-family="Arial, sans-serif" font-size="128" font-weight="800" fill="#ff6a52" letter-spacing="-5">systems.</text>

  <text x="90" y="505" font-family="Arial, sans-serif" font-size="30" fill="#b8b3ab">Operations · Automation · AI · Data — different problems, same approach.</text>

  <!-- evidence strip -->
  <g font-family="Arial, sans-serif" font-size="26" font-weight="700">
    <rect x="88" y="545" width="290" height="52" rx="26" fill="#1e1e21" stroke="#3a3a3f"/>
    <text x="233" y="579" fill="#ece9e3" text-anchor="middle">3 apps, source open</text>
    <rect x="394" y="545" width="250" height="52" rx="26" fill="#1e1e21" stroke="#3a3a3f"/>
    <text x="519" y="579" fill="#ece9e3" text-anchor="middle">7 live demos</text>
    <rect x="660" y="545" width="290" height="52" rx="26" fill="#ff6a52"/>
    <text x="805" y="579" fill="#161616" text-anchor="middle">every claim testable</text>
  </g>
</svg>`;

await mkdir(dirname(out), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(out);
const meta = await sharp(out).metadata();
console.log(`wrote ${out} — ${meta.width}x${meta.height}`);

/* The favicon and touch icon used to be generated here from an "AS" text
 * mark. They are now drawn from the real logo geometry by scripts/logo.mjs,
 * which owns every file-on-disk version of the mark — run `npm run logo`. */

/* --- Per-route cards -------------------------------------------------------
 * Until now all twelve routes shared this one image, so a shared case-file
 * link and a shared demo link previewed identically — the card said nothing
 * about what was being shared. Each route now gets its own, in the same
 * language as the home card: dark ground, the AS mark, a coral rule, and a
 * kicker naming what kind of page it is.
 *
 * The PNGs are committed, so the build and the deploy still need neither
 * sharp nor this script. Re-run `npm run og` after changing a title.
 */
import { routes } from "./routes.mjs";

/** SVG has five reserved characters and no HTML entities beyond them. */
const escapeXml = value =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/**
 * Greedy wrap at a character budget. The card's type is one weight at one
 * size, so characters are a close enough proxy for width, and being slightly
 * conservative simply leaves more margin.
 */
function wrap(text, perLine, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  let used = 0;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
    used += 1;
  }
  if (line && lines.length < maxLines) lines.push(line);

  // An ellipsis only when words were actually dropped. A card that stops
  // mid-sentence with no mark reads as a rendering fault rather than as a
  // summary, and the trailing punctuation left behind by the cut goes too.
  if (used < words.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines.at(-1).replace(/[\s,;:.—-]+$/, "")}…`;
  }
  return lines;
}

/** "Feedback Copilot — case file — Abdelrhman Shoman" -> the middle two parts. */
function splitTitle(title) {
  const parts = title.split(" — ");
  return {
    name: parts[0],
    kicker: (parts.length > 2 ? parts[1] : "PORTFOLIO").toUpperCase(),
  };
}

const routeCard = (name, kicker, blurb) => {
  // Two lines, not three: a third at this size pushes the blurb through the
  // footer. Product names are short — the longest here is 26 characters — so
  // the cap never actually bites, and `wrap` marks it if one ever does.
  const nameLines = wrap(name, 22, 2);
  // The blurb follows the title rather than sitting at a fixed line, so a
  // one-line name does not leave a hole through the middle of the card.
  const blurbTop = 268 + nameLines.length * 104 + 34;

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#121213"/>

  <!-- the loop, faint, as structure — the same mark as the home card -->
  <g fill="none" stroke="#2b2b2f" stroke-width="2">
    <circle cx="1105" cy="92" r="205"/>
    <circle cx="1105" cy="92" r="136"/>
  </g>
  ${brandMark(1035, 26, 1.32, "#ece9e3", "#ff6a52")}

  <text x="90" y="132" font-family="Arial, sans-serif" font-size="24" font-weight="700"
        fill="#ff6a52" letter-spacing="6">${escapeXml(kicker)}</text>

  <rect x="90" y="158" width="86" height="4" fill="#ff6a52"/>

  ${nameLines
    .map(
      (line, index) =>
        `<text x="86" y="${268 + index * 104}" font-family="Arial, sans-serif" font-size="92" font-weight="800" fill="#ece9e3" letter-spacing="-4">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  ${wrap(blurb, 74, 2)
    .map(
      (line, index) =>
        `<text x="90" y="${blurbTop + index * 40}" font-family="Arial, sans-serif" font-size="28" fill="#b8b3ab">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <text x="90" y="596" font-family="Arial, sans-serif" font-size="23" font-weight="700"
        fill="#8d8880" letter-spacing="4">ABDELRHMAN SHOMAN — SYSTEMS BUILDER</text>
</svg>`;
};

for (const route of routes()) {
  if (route.path === "/") continue; // the home card above
  const { name, kicker } = splitTitle(route.title);
  const file = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public", route.image);
  await mkdir(dirname(file), { recursive: true });
  await sharp(Buffer.from(routeCard(name, kicker, route.description))).png().toFile(file);
  console.log(`wrote ${route.image} — ${name}`);
}
