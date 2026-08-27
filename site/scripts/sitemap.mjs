/*
 * Generates client/public/sitemap.xml from the same registries that drive the
 * site, so a new demo or built system cannot be silently missing from it.
 *
 * The site is client-rendered with no prerender step, so deep-route discovery
 * would otherwise depend entirely on a crawler executing JavaScript.
 *
 * Run via `npm run sitemap` (and automatically as part of `npm run build`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = (process.env.SITE_URL ?? "https://ashomanportfolio.vercel.app").replace(/\/+$/, "");

/** Pull the string literals out of a source file without importing TypeScript. */
function extract(file, pattern) {
  const source = readFileSync(join(root, file), "utf8");
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

const demoSlugs = extract("client/src/demos/registry.ts", /slug:\s*"([^"]+)"/g);
const systemTitles = extract("client/src/content/portfolio.ts", /^\s{4}title:\s*"([^"]+)"/gm);

// Mirrors slugFor in client/src/content/slugs.ts.
const slugFor = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The built systems are the first three entries in portfolio.ts, and they are
// the only ones with case-file routes.
const systemSlugs = systemTitles.slice(0, 3).map(slugFor);

const urls = [
  { loc: "/", priority: "1.0" },
  ...systemSlugs.map((slug) => ({ loc: `/system/${slug}`, priority: "0.8" })),
  ...demoSlugs.map((slug) => ({ loc: `/demo/${slug}`, priority: "0.7" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>\n    <loc>${origin}${url.loc}</loc>\n    <priority>${url.priority}</priority>\n  </url>`)
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "client", "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${urls.length} URLs (${systemSlugs.length} case files, ${demoSlugs.length} demos)`);
