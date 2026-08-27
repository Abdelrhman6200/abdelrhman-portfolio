/*
 * Error boundary.
 *
 * Rewritten from the scaffold version, which printed the raw stack trace to
 * the visitor. On a portfolio arguing its author builds reliable systems, a
 * wall of bundle internals is the worst possible failure mode — it reads as
 * broken software. The trace now goes to the console, where the owner can
 * find it, and the visitor gets a page in the site's own voice with a way out.
 *
 * The most likely real cause here is a stale lazy chunk after a redeploy: the
 * loaded HTML references hashed filenames that no longer exist. Reloading is
 * the correct fix for that, so it is offered first — but "try again" resets
 * the boundary in place, which recovers a transient network failure without
 * discarding the session.
 */
import { AlertTriangle, RotateCcw, Undo2 } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import "../reference.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Previously nothing was logged, so failures were invisible to the owner.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="reference-page">
        {/* role="alert" so the replacement is announced, not silently swapped. */}
        <main className="ref-section eb-shell" role="alert">
          <div className="ref-kicker">
            <AlertTriangle size={13} aria-hidden="true" /> SOMETHING BROKE
          </div>
          <h1>
            That didn&rsquo;t load
            <br />
            <em>as it should.</em>
          </h1>
          <p className="eb-copy">
            Most often this means the site was updated while your tab was open, and it is holding a
            reference to a file that no longer exists. Reloading fixes that. If it keeps happening, I would
            genuinely like to know — the address is on the home page.
          </p>
          <div className="eb-actions">
            <button type="button" className="ref-button ref-button-accent" onClick={() => window.location.reload()}>
              <RotateCcw size={15} aria-hidden="true" /> Reload the page
            </button>
            <button type="button" className="ref-text-link" onClick={this.reset}>
              <Undo2 size={14} aria-hidden="true" /> Try again without reloading
            </button>
          </div>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
