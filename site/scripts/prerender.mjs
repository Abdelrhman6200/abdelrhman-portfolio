/*
 * Writes a static HTML shell per route into dist/, with that route's real
 * title, description, canonical and social tags baked in.
 *
 * The site is client-rendered, and useDocumentMeta fixes the tags only once
 * JavaScript runs — so crawlers and link-unfurlers that do not execute JS were
 * seeing the home shell's meta for every one of the 11 routes. Static hosts
 * serve a real file in preference to the SPA rewrite (filesystem beats
 * rewrites on both Vercel and Netlify), and the SPA hydrates over any path,
 * so browsers are unaffected.
 *
 * Runs after `vite build`; the route list is shared with the sitemap.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { origin, routes } from "./routes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const shell = readFileSync(join(dist, "index.html"), "utf8");
const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function shellFor(route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const url = `${origin}${route.path}`;

  // Page-level structured data, alongside the site-level Person the shell
  // already carries. mainEntityOfPage ties the entity to this URL, so the two
  // blocks describe one page rather than competing for it.
  const schema = route.schema
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        ...route.schema,
        url,
        mainEntityOfPage: url,
        author: { "@type": "Person", name: "Abdelrhman Shoman" },
      })}</script>`
    : "";

  return shell
    .replace("</head>", `${schema}</head>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
}

let written = 0;
for (const route of routes()) {
  if (route.path === "/") continue; // dist/index.html is already the home shell
  const dir = join(dist, ...route.path.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), shellFor(route));
  written += 1;
}

console.log(`prerender: ${written} route shells written under dist/`);
