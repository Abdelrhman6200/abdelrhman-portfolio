/*
 * The shared route list, which the sitemap and the prerendered shells are
 * both generated from.
 *
 * This is build-time code with no UI, which is exactly why it needs pinning:
 * a regex that stops matching after a content edit returns fewer routes
 * instead of failing, and the result is a page that quietly drops out of the
 * sitemap and loses its meta. Nobody notices until a search result is wrong
 * weeks later. Asserting against the real content modules means a system or
 * demo added to the site must appear here or the suite fails.
 */
import { describe, expect, it } from "vitest";
import { origin, routes } from "../../scripts/routes.mjs";
import { builtSystems } from "@/content/portfolio";
import { demos } from "@/demos/registry";
import { slugFor } from "@/content/slugs";

const all = routes();

describe("route list", () => {
  it("covers the home page, the CV, every case file and every demo", () => {
    expect(all).toHaveLength(2 + builtSystems.length + demos.length);
    const paths = all.map((route) => route.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/cv");
    for (const system of builtSystems) expect(paths).toContain(`/system/${slugFor(system.title)}`);
    for (const demo of demos) expect(paths).toContain(`/demo/${demo.slug}`);
  });

  it("gives every route a unique path and a unique title", () => {
    expect(new Set(all.map((route) => route.path)).size).toBe(all.length);
    expect(new Set(all.map((route) => route.title)).size).toBe(all.length);
  });

  it("extracts the real summaries rather than a placeholder", () => {
    // The case-file descriptions are pulled out of portfolio.ts by regex; if
    // that stops matching, this is where it shows.
    for (const system of builtSystems) {
      const route = all.find((entry) => entry.path === `/system/${slugFor(system.title)}`);
      expect(route?.description).toBe(system.summary);
    }
  });

  it("keeps every description inside what a search result will show", () => {
    for (const route of all) {
      expect(route.description.length).toBeGreaterThan(50);
      expect(route.description.length).toBeLessThanOrEqual(320);
    }
  });

  it("names the site in every title", () => {
    for (const route of all) expect(route.title).toContain("Abdelrhman Shoman");
  });

  it("describes what each page is, in structured data a crawler reads", () => {
    const typeFor = (path: string) => all.find((route) => route.path === path)?.schema?.["@type"];
    expect(typeFor(`/system/${slugFor(builtSystems[0].title)}`)).toBe("SoftwareApplication");
    expect(typeFor(`/demo/${demos[0].slug}`)).toBe("WebApplication");
    expect(typeFor("/cv")).toBe("ProfilePage");
    // The home page is the Person, which the shell already carries.
    expect(typeFor("/")).toBeUndefined();
  });

  it("produces an origin with no trailing slash, so paths concatenate cleanly", () => {
    expect(origin).toMatch(/^https?:\/\//);
    expect(origin.endsWith("/")).toBe(false);
  });

  it("gives the home page the highest priority in the sitemap", () => {
    const home = all.find((route) => route.path === "/");
    expect(Number(home?.priority)).toBe(1);
    for (const route of all) expect(Number(route.priority)).toBeLessThanOrEqual(1);
  });
});
