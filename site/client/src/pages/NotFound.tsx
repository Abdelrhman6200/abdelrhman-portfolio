/*
 * 404 — in the site's own voice and palette, with useful exits.
 *
 * A portfolio's dead link is most often a shared demo or case-file URL that
 * got truncated in a chat message, so the page offers those routes back
 * rather than a bare "go home".
 */
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { demos } from "@/demos/registry";
import "../reference.css";
import "../demos/demos.css";

export default function NotFound() {
  return (
    <div className="reference-page">
      <main className="ref-section nf-shell">
        <div className="ref-kicker">404 / NO SUCH ROUTE</div>
        <h1>
          This path leads
          <br />
          <em>nowhere.</em>
        </h1>
        <p className="nf-copy">
          <Compass size={14} aria-hidden="true" /> If a shared link brought you here, it was probably
          truncated. Everything worth seeing is one hop away:
        </p>

        <div className="nf-routes">
          <Link className="ref-button ref-button-accent" href="/">
            <ArrowLeft size={15} aria-hidden="true" /> The portfolio
          </Link>
          <Link className="ref-text-link" href="/#work">
            Built software <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link className="ref-text-link" href="/#method">
            The method <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="ref-demo-strip nf-strip" role="navigation" aria-label="Live demos">
          <span className="ref-demo-strip-label">OR RUN A LIVE DEMO</span>
          {demos.map((demo) => (
            <Link key={demo.slug} href={`/demo/${demo.slug}`}>
              {demo.title}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
