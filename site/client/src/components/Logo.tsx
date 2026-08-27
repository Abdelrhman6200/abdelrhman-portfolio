/*
 * The mark: "the return".
 *
 * An S drawn as routing — the path leaves, turns twice, and comes back on
 * itself. It is a letter and a diagram of the same idea at once, which is
 * why it was chosen over a monogram: the site argues that different problems
 * run through one repeated approach, and this is that sentence as a shape.
 *
 * Geometry lives here and in scripts/logo.mjs, which renders the favicon,
 * the touch icon and the social cards from the identical path data. The two
 * are kept in step by a test that compares them, because a mark that drifts
 * between the tab and the page is worse than no mark.
 *
 * Drawn with `currentColor` so it inherits whatever it sits on, with the
 * terminal in the accent. One colour, no gradients: it survives a favicon, a
 * stamp, and a black-and-white printout.
 */

/** The routed path, shared with the asset generator. Do not edit one alone. */
export const LOGO_PATH = "M72 26 L34 26 L34 50 L66 50 L66 74 L28 74 M28 74 L28 62";
/** Where the work enters — the accent terminal. */
export const LOGO_TERMINAL = { cx: 72, cy: 26, r: 10 };
export const LOGO_STROKE = 10;

export default function Logo({
  size = 38,
  /** Decorative beside a visible wordmark; titled when it stands alone. */
  title,
}: {
  size?: number;
  title?: string;
}) {
  return (
    <svg
      className="brand-logo"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        d={LOGO_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={LOGO_STROKE}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <circle
        cx={LOGO_TERMINAL.cx}
        cy={LOGO_TERMINAL.cy}
        r={LOGO_TERMINAL.r}
        className="brand-logo-terminal"
      />
    </svg>
  );
}
