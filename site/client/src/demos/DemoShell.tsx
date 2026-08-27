/*
 * Shared chrome for the in-site demos.
 *
 * Every demo is a browser re-implementation of its project's core logic —
 * synthetic data, nothing leaves the page — and the shell says so once, in the
 * same place, so no individual demo can oversell itself.
 */
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import "../reference.css";
import "./demos.css";

export default function DemoShell({
  title,
  lede,
  caseFileSlug,
  children,
}: {
  title: string;
  /** One sentence: what to try, and what to watch happen. */
  lede: string;
  /** Slug of the matching /system/ case file, when one exists. */
  caseFileSlug?: string;
  children: ReactNode;
}) {
  return (
    <div className="reference-page demo-root">
      <a className="skip-link" href="#demo-main">
        Skip to content
      </a>

      <header className="demo-bar">
        <Link className="demo-bar-back" href="/#work">
          <ArrowLeft size={15} aria-hidden="true" /> BACK TO THE WORK
        </Link>
        <span className="demo-bar-honesty">
          <FlaskConical size={12} aria-hidden="true" />
          LIVE DEMO / SYNTHETIC DATA / RUNS ENTIRELY IN YOUR BROWSER
        </span>
        <ThemeToggle />
      </header>

      <main id="demo-main" className="demo-main">
        <div className="demo-head">
          <h1>{title}</h1>
          <p>{lede}</p>
        </div>

        {children}

        {caseFileSlug ? (
          <footer className="demo-foot">
            <p>
              This demo re-implements the system&rsquo;s core logic client-side. The shipped application
              enforces the same rules server-side, with automated tests.
            </p>
            <Link className="ref-text-link" href={`/system/${caseFileSlug}`}>
              Read the full case file <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </footer>
        ) : (
          <footer className="demo-foot">
            <p>
              This demo re-implements the system&rsquo;s core logic client-side, from the operator&rsquo;s
              record of how the original worked.
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
