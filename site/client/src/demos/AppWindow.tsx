/*
 * The fake application window every demo renders inside.
 *
 * The chrome does real work: it frames each demo as the product it represents
 * (a workspace, a control tower, a spreadsheet) rather than a settings form,
 * and it carries the live status readout — signed-in identity, record counts,
 * a clock — that makes the surface read as running software.
 */
import type { ReactNode } from "react";

export default function AppWindow({
  name,
  meta,
  tone = "paper",
  children,
}: {
  /** Title-bar text, e.g. "Feedback Copilot — workspace". */
  name: string;
  /** Right side of the title bar: identity chip, counts, clock. */
  meta?: ReactNode;
  /** "paper" follows the theme; "console" is the permanently dark surface. */
  tone?: "paper" | "console";
  children: ReactNode;
}) {
  return (
    <div className={`app-window app-window-${tone}`}>
      <div className="app-window-bar">
        <span className="app-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="app-window-name">{name}</span>
        {meta ? <span className="app-window-meta">{meta}</span> : null}
      </div>
      <div className="app-window-body">{children}</div>
    </div>
  );
}
