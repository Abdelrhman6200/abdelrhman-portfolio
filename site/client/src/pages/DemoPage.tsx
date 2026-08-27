/*
 * Route host for /demo/:slug — resolves the demo from the registry, or shows
 * a small not-found state for a dead link.
 */
import { ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { demoBySlug } from "@/demos/registry";
import "../reference.css";

export default function DemoPage() {
  const [, params] = useRoute("/demo/:slug");
  const entry = params?.slug ? demoBySlug(params.slug) : undefined;

  if (!entry) {
    return (
      <div className="reference-page">
        <section className="ref-section case-missing">
          <div className="ref-kicker">404 / NO SUCH DEMO</div>
          <h1>That demo does not exist.</h1>
          <Link className="ref-text-link" href="/#work">
            <ArrowLeft size={15} aria-hidden="true" /> Back to the work
          </Link>
        </section>
      </div>
    );
  }

  const Demo = entry.component;
  return <Demo />;
}
