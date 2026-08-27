/*
 * Case file for one piece of shipped software.
 *
 * The card on the home page has to be brief. This is the room to show the
 * whole thing: the pipeline running at full size, what each stage does, the
 * claims a reader can check in source, and where the project sits in the
 * method the rest of the site argues for.
 */
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, FileCode2, Github } from "lucide-react";
import { Link, useRoute } from "wouter";
import SystemSimulation from "@/components/SystemSimulation";
import ThemeToggle from "@/components/ThemeToggle";
import { builtSystems, evidenceLabels } from "@/content/portfolio";
import { simulationFor } from "@/content/simulations";
import { demoPathFor } from "@/demos/registry";
import "../reference.css";

/** Stable, readable URL slug for a built system. */
export function slugFor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SystemCaseFile() {
  const [, params] = useRoute("/system/:slug");
  const project = builtSystems.find((item) => slugFor(item.title) === params?.slug);
  const [activeStage, setActiveStage] = useState(0);

  if (!project) {
    return (
      <div className="reference-page">
        <section className="ref-section case-missing">
          <div className="ref-kicker">404 / NO SUCH SYSTEM</div>
          <h1>That case file does not exist.</h1>
          <Link className="ref-text-link" href="/#work">
            <ArrowLeft size={15} aria-hidden="true" /> Back to the work
          </Link>
        </section>
      </div>
    );
  }

  const sim = simulationFor(project.kind, project.flow, project.accent);
  const stage = sim.stages[activeStage];

  return (
    <div className="reference-page">
      <a className="skip-link" href="#case-main">
        Skip to content
      </a>

      <header className="case-nav">
        <Link className="case-back" href="/#work">
          <ArrowLeft size={15} aria-hidden="true" /> BACK TO THE WORK
        </Link>
        <div className="case-nav-right">
          <ThemeToggle />
          <span className={`ref-evidence ref-evidence-${project.evidence}`}>
          <FileCode2 size={11} aria-hidden="true" />
          {evidenceLabels[project.evidence].label}
        </span>
        </div>
      </header>

      <main id="case-main" className="ref-section case-shell">
        <div className="case-head">
          <div className="ref-kicker">
            {project.number} / {project.subtitle.toUpperCase()}
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="ref-project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          {project.stats ? (
            <dl className="ref-feature-stats case-stats">
              {project.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <section className="case-sim-block" aria-labelledby="case-pipeline">
          <div className="case-sim-copy">
            <h2 id="case-pipeline">The pipeline, running.</h2>
            <p>
              This is the shape of the system: work enters on the left and leaves as a finished unit on the
              right. Select a stage to read what it does.
            </p>

            <div className="case-stage-list" role="group" aria-label={`${project.title} stages`}>
              {sim.stages.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  className={`case-stage ${index === activeStage ? "is-active" : ""}`}
                  aria-pressed={index === activeStage}
                  onClick={() => setActiveStage(index)}
                >
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  {item.label}
                </button>
              ))}
            </div>

            <p className="case-stage-detail">{stage?.detail}</p>
          </div>

          <div className="case-sim-slot">
            <SystemSimulation spec={sim} label={`${project.title} pipeline`} />
          </div>
        </section>

        {project.verifiable ? (
          <section className="case-verifiable" aria-labelledby="case-checks">
            <h2 id="case-checks">What you can check in the source.</h2>
            <p className="case-verifiable-lead">
              Every line below is a property of the code, not a claim about an outcome. Each is readable in the
              project&rsquo;s own repository under <code>projects/</code>.
            </p>
            <ul>
              {project.verifiable.map((fact) => (
                <li key={fact}>
                  <Check size={14} aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {demoPathFor(project.kind) ? (
          <section className="case-demo-callout">
            <div>
              <span className="ref-kicker">TRY IT</span>
              <p>
                This system has a live demo — its core logic re-implemented in the browser, on synthetic
                data, so you can work the actual gates rather than read about them.
              </p>
            </div>
            <Link className="ref-button ref-button-accent" href={demoPathFor(project.kind)!}>
              Run the live demo <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <section className="case-foot">
          <div>
            <span className="ref-kicker">SOURCE</span>
            <p>
              This application ships with its own README, automated tests and standalone authentication — it
              depends on no hosting platform to run.
            </p>
          </div>
          {project.repo ? (
            <a className="ref-button ref-button-accent" href={project.repo} target="_blank" rel="noreferrer">
              Repository <Github size={15} aria-hidden="true" />
            </a>
          ) : (
            <span className="case-foot-note">
              <Github size={14} aria-hidden="true" /> Source included in this portfolio bundle
            </span>
          )}
        </section>
      </main>
    </div>
  );
}
