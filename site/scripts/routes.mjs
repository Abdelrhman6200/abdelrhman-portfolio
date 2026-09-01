/*
 * The one route+meta list, shared by sitemap.mjs and prerender.mjs so the two
 * can never disagree about what pages exist.
 *
 * Titles and summaries are extracted from the same source files that drive the
 * running site (content/portfolio.ts, demos/registry.ts) with the regex
 * technique already proven in the sitemap generator — so a new demo or built
 * system appears here without anyone remembering to add it.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const origin = (process.env.SITE_URL ?? "https://ashomanportfolio.vercel.app").replace(/\/+$/, "");

const read = (rel) => readFileSync(join(root, rel), "utf8");

/** Mirrors slugFor in client/src/content/slugs.ts. */
const slugFor = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const HOME_DESCRIPTION =
  "I turn messy business operations into structured, automated systems that are easier to run, scale and improve. Operations design, AI automation, workflow engineering.";

export function routes() {
  const portfolio = read("client/src/content/portfolio.ts");
  const registry = read("client/src/demos/registry.ts");

  // The built systems are the objects carrying a `verifiable` list; capture
  // title + summary per object so descriptions are the real ones.
  const systems = [...portfolio.matchAll(
    /title: "([^"]+)",[\s\S]{0,400}?summary:\s*\n?\s*"([^"]+)",[\s\S]{0,600}?verifiable:/g
  )].map(([, title, summary]) => ({ title, summary }));

  const demos = [...registry.matchAll(/slug: "([^"]+)", title: "([^"]+)"/g)].map(([, slug, title]) => ({
    slug,
    title,
  }));

  return [
    {
      path: "/",
      title: "Abdelrhman Shoman — Systems Builder for Operations & AI Automation",
      description: HOME_DESCRIPTION,
      priority: "1.0",
      image: "/og.png",
    },
    ...systems.map((system) => ({
      path: `/system/${slugFor(system.title)}`,
      title: `${system.title} — case file — Abdelrhman Shoman`,
      description: system.summary,
      priority: "0.8",
      image: `/og/system-${slugFor(system.title)}.png`,
      // A case file is about a piece of software, so say so in the markup a
      // crawler reads rather than leaving it to infer from prose.
      schema: {
        "@type": "SoftwareApplication",
        name: system.title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: system.summary,
      },
    })),
    {
      path: "/cv",
      title: "Curriculum vitae — Abdelrhman Shoman",
      description:
        "Abdelrhman Shoman — systems builder. Shipped applications, operational systems and the record behind them, each labelled by evidence tier.",
      priority: "0.9",
      image: "/og/cv.png",
      schema: { "@type": "ProfilePage", name: "Curriculum vitae — Abdelrhman Shoman" },
    },
    ...demos.map((demo) => ({
      path: `/demo/${demo.slug}`,
      title: `${demo.title} — live demo — Abdelrhman Shoman`,
      description: `Live in-browser demo of ${demo.title}: the system's core logic re-implemented client-side, on synthetic data, driven by you.`,
      priority: "0.7",
      image: `/og/demo-${demo.slug}.png`,
      schema: {
        "@type": "WebApplication",
        name: `${demo.title} — live demo`,
        applicationCategory: "BusinessApplication",
        browserRequirements: "Requires JavaScript",
        operatingSystem: "Web",
        // Stated because it is true, and because it is the reassurance a
        // reader wants before running someone else's code in their browser.
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    })),
  ];
}
