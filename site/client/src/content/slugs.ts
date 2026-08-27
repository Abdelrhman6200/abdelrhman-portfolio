/** Stable, readable URL slug for a built system's case file. */
export function slugFor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
