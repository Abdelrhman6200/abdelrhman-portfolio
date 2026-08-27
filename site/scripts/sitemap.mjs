/*
 * Generates client/public/sitemap.xml and robots.txt from the shared route
 * list in routes.mjs, so neither can disagree with the prerendered pages.
 * Runs as the first step of `npm run build`.
 *
 * robots.txt is generated rather than hand-written because it carries the
 * sitemap's absolute URL: a hand-written one keeps pointing at the old host
 * after a domain change, and the failure is silent — the site looks fine and
 * the sitemap is simply never fetched.
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

/* Everything is public and everything should be indexed — there is no admin
 * surface and no private route to keep out. */
const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

writeFileSync(join(root, "client", "public", "robots.txt"), robots);
console.log(`robots.txt: sitemap at ${origin}/sitemap.xml`);
