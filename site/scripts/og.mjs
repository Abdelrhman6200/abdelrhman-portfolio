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

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public", "og.png");

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#121213"/>

  <!-- the loop, faint, as structure -->
  <g fill="none" stroke="#2b2b2f" stroke-width="2">
    <circle cx="1100" cy="90" r="210"/>
    <circle cx="1100" cy="90" r="140"/>
  </g>
  <circle cx="1100" cy="90" r="70" fill="#1a1a1c" stroke="#3a3a3f" stroke-width="2"/>
  <text x="1100" y="108" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="#ece9e3" text-anchor="middle" letter-spacing="-3">AS</text>

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

/* Touch icon and PNG favicon fallback — same mark, so the tab, the home screen
 * and the social card stay one identity. Older Safari and some feed readers do
 * not render an SVG favicon. */
const mark = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#121213"/>
  <text x="256" y="330" font-family="Arial, sans-serif" font-size="215" font-weight="800"
        fill="#ece9e3" text-anchor="middle" letter-spacing="-12">AS</text>
</svg>`;

for (const [name, size] of [["apple-touch-icon.png", 180], ["favicon-96.png", 96]]) {
  const file = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public", name);
  await sharp(Buffer.from(mark)).resize(size, size).png().toFile(file);
  console.log(`wrote ${name} — ${size}x${size}`);
}
