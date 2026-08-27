/*
 * The CV, generated from the site's own content module.
 *
 * A portfolio without a CV asks a hiring manager to reconstruct one from
 * nine scrolling sections. This is that document — but it is not a separate
 * artefact that drifts: every system, role and capability here is read from
 * `content/portfolio.ts`, the same source the site renders from, so updating
 * one updates both. It is print-first, so Cmd/Ctrl+P produces a clean PDF
 * with no header, no navigation and no dark ground.
 *
 * Evidence tiers survive the trip: each system carries the same `code` /
 * `brief` label it carries on the site, because a CV is exactly where an
 * unlabelled claim would do the most damage.
 */
import { ArrowLeft, Github, Mail, MapPin, Printer } from "lucide-react";
import { Link } from "wouter";
import {
  builtSystems,
  contact,
  evidenceLabels,
  experiences,
  featuredProjects,
  methodStages,
  projectArchive,
  services,
} from "@/content/portfolio";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import "../reference.css";
import "./cv.css";

/** Tools across all services, de-duplicated, in declaration order. */
const capabilities = Array.from(new Set(services.flatMap((service) => service.tools)));

export default function Curriculum() {
  useDocumentMeta({
    title: "Curriculum vitae",
    description:
      "Abdelrhman Shoman — systems builder. Shipped applications, operational systems and the record behind them, each labelled by evidence tier.",
  });

  return (
    <div className="reference-page cv-root">
      <a className="skip-link" href="#cv-main">
        Skip to content
      </a>

      {/* Screen-only chrome: absent from the printed page. */}
      <div className="cv-bar">
        <Link className="cv-bar-back" href="/">
          <ArrowLeft size={15} aria-hidden="true" /> BACK TO THE SITE
        </Link>
        <button type="button" className="ref-button ref-button-accent" onClick={() => window.print()}>
          <Printer size={15} aria-hidden="true" /> Print / save as PDF
        </button>
      </div>

      <main id="cv-main" className="cv-sheet">
        <header className="cv-head">
          <div>
            <h1>Abdelrhman Shoman</h1>
            <p className="cv-title">Systems Builder — operations, automation, AI and data</p>
          </div>
          <ul className="cv-contact">
            <li>
              <Mail size={12} aria-hidden="true" />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <Github size={12} aria-hidden="true" />
              <a href={contact.github}>{contact.githubHandle}</a>
            </li>
            {contact.linkedin ? (
              <li>
                <a href={contact.linkedin}>LinkedIn</a>
              </li>
            ) : null}
            <li>
              <MapPin size={12} aria-hidden="true" />
              {contact.location}
            </li>
          </ul>
        </header>

        <section className="cv-lede">
          <p>
            I build the systems behind complex work. The same eight-stage loop —{" "}
            {methodStages.map((stage) => stage.name).join(" → ")} — applied to education operations,
            organizational quality and AI-assisted workflows. Every claim below is labelled by what backs
            it: readable source, or an outcome reported by the organization it ran inside.
          </p>
        </section>

        <section className="cv-section">
          <h2>Shipped applications</h2>
          <p className="cv-section-note">
            {evidenceLabels.code.note}
          </p>
          {builtSystems.map((project) => (
            <article key={project.number} className="cv-entry">
              <h3>
                {project.title}
                <span className="cv-tier">{evidenceLabels[project.evidence].label}</span>
              </h3>
              <p className="cv-entry-sub">{project.subtitle}</p>
              <p>{project.summary}</p>
              {project.verifiable ? (
                <ul className="cv-bullets">
                  {project.verifiable.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              <p className="cv-stack">{project.tags.join(" · ")}</p>
            </article>
          ))}
        </section>

        <section className="cv-section">
          <h2>Operational systems delivered</h2>
          <p className="cv-section-note">{evidenceLabels.brief.note}</p>
          <ul className="cv-list">
            {featuredProjects.map((project) => (
              <li key={project.number}>
                <b>{project.title}</b>
                <span>{project.summary}</span>
                {project.result ? <em>{project.result.replace(/^Reported: /, "")}</em> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h2>Experience</h2>
          {experiences.map((item) => (
            <article key={item.number} className="cv-entry cv-entry-role">
              <h3>
                {item.role} — {item.name}
                {item.period ? <span className="cv-period">{item.period}</span> : null}
              </h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <section className="cv-section">
          <h2>Capabilities</h2>
          <div className="cv-capabilities">
            {services.map((service) => (
              <div key={service.key}>
                <h3>{service.label}</h3>
                <p>{service.body}</p>
              </div>
            ))}
          </div>
          <p className="cv-stack cv-stack-wide">{capabilities.join(" · ")}</p>
        </section>

        <section className="cv-section cv-section-record">
          <h2>The rest of the record</h2>
          <ul className="cv-record">
            {projectArchive.map((project) => (
              <li key={project.number}>
                <b>{project.title}</b> — {project.summary}
              </li>
            ))}
          </ul>
        </section>

        <footer className="cv-foot">
          <span>
            Generated from the portfolio&rsquo;s own content module — this document and the site cannot
            disagree.
          </span>
          <span>{contact.availability}</span>
        </footer>
      </main>
    </div>
  );
}
