/*
 * Generates client/public/sitemap.xml from the shared route list in
 * routes.mjs, so it can never disagree with the prerendered pages.
 * Runs as the first step of `npm run build`.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { origin, routes } from "./routes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const all = routes();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map((route) => `  <url>\n    <loc>${origin}${route.path}</loc>\n    <priority>${route.priority}</priority>\n  </url>`)
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "client", "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${all.length} URLs`);
