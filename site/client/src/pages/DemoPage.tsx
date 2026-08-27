/*
 * Route host for /demo/:slug — resolves the demo from the registry and loads
 * its chunk on demand, so the demos cost the home page nothing.
 */
import { Suspense, lazy, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import Logo from "@/components/Logo";
import { demoBySlug } from "@/demos/registry";
import "../reference.css";

/** Branded loading state, shown for the moment a demo chunk is in flight. */
export function PageLoading() {
  return (
    <div className="reference-page">
      <div className="page-loading" role="status" aria-label="Loading">
        <span className="page-loading-mark"><Logo size={30} /></span>
        <span className="page-loading-text">LOADING…</span>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [, params] = useRoute("/demo/:slug");
  const entry = params?.slug ? demoBySlug(params.slug) : undefined;

  // Memoised per slug: a fresh lazy() every render would remount the demo.
  const Demo = useMemo(() => (entry ? lazy(entry.load) : null), [entry?.slug]);

  if (!entry || !Demo) {
    return (
      <div className="reference-page">
      <a className="skip-link" href="#demo-main">
        Skip to content
      </a>
      <main id="demo-main" className="ref-section case-missing">
        <div className="ref-kicker">404 / NO SUCH DEMO</div>
        <h1>That demo does not exist.</h1>
        <Link className="ref-text-link" href="/#work">
          <ArrowLeft size={15} aria-hidden="true" /> Back to the work
        </Link>
      </main>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Demo />
    </Suspense>
  );
}
