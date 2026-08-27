/*
 * Types for the shared route list.
 *
 * routes.mjs is plain ESM because it runs under bare node during the build,
 * before any TypeScript exists — but it is imported by a test, and an
 * untyped import there would make the assertions meaningless. This is the
 * contract the sitemap, the prerenderer and that test all rely on.
 */

/** Page-level JSON-LD, merged into the shell by the prerenderer. */
export type RouteSchema = {
  "@type": string;
  [property: string]: unknown;
};

export type Route = {
  /** Absolute path, always leading-slashed: "/", "/cv", "/demo/agent". */
  path: string;
  title: string;
  /** Meta description; also the og/twitter description. */
  description: string;
  /** Sitemap priority, "0.0" to "1.0". */
  priority: string;
  /** Absent on the home page, which is covered by the shell's Person block. */
  schema?: RouteSchema;
};

/** Deployment origin, never trailing-slashed. */
export const origin: string;

/** Every route the site publishes, home first. */
export function routes(): Route[];
