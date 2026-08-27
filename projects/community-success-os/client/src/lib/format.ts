/*
 * Display formatting shared by the workspace pages.
 *
 * `initials` was defined twice — once in Home.tsx and once in
 * OperationsPages.tsx — which is exactly how two avatar treatments drift
 * apart. These now live in one place, which also makes them testable: every
 * name, date and status label the workspace renders passes through here.
 */

/** Short date for timeline and record rows; an em dash when there is none. */
export function fmtDate(value?: Date | string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  // Imported records carry whatever the source system had. Showing nothing is
  // better than showing "Invalid Date" next to a student's name.
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Up to two initials for an avatar chip. */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Turns a stored enum value ("at_risk") into something readable. */
export function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}
