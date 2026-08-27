/*
 * The first thing keyboard focus lands on.
 *
 * Every screen in this app puts a sidebar or a toolbar ahead of the content,
 * which is a lot of tab stops to cross before reaching the work. This lets
 * anyone navigating by keyboard step straight past it.
 *
 * Hidden until focused, which is the point: it costs sighted mouse users
 * nothing and is the first stop for everyone else.
 */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
  );
}
