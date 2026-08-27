/*
 * Portfolio home.
 *
 * Structure follows one argument, in order:
 *   1. Hero      — the claim: different problems, same approach.
 *   2. About     — who is making the claim.
 *   3. Method    — the proof. One approach read across unrelated domains.
 *   4. Services  — the domains that approach gets applied to.
 *   5. Work      — shipped software first (readable source), then reported work.
 *   6. Index     — the full record, filterable, every item evidence-tagged.
 *   7. Contact   — a real, working way to start a conversation.
 *
 * Content lives in `@/content/portfolio`; this file is presentation only.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  FileCode2,
  FileDown,
  Github,
  Linkedin,
  Mail,
  Menu,
  Play,
  RotateCw,
  Search,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import {
  allProjects,
  builtSystems,
  contact,
  evidenceLabels,
  experiences,
  featuredProjects,
  methodStages,
  projectArchive,
  services,
  sharedCore,
  type Domain,
  type Project,
  type ServiceKey,
} from "@/content/portfolio";
import { Link } from "wouter";
import { simulationFor } from "@/content/simulations";
import { demoPathFor, demos } from "@/demos/registry";
import AppWindow from "@/demos/AppWindow";
import SystemSimulation from "@/components/SystemSimulation";
import HeroSystem from "@/components/HeroSystem";
import ThemeToggle from "@/components/ThemeToggle";
import { openCommandPalette } from "@/components/CommandPalette";
import { slugFor } from "@/content/slugs";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import "../reference.css";

const navSectionIds = [
  "about",
  "method",
  "services",
  "work",
  "case-files",
  "index",
  "experience",
  "contact",
];

const navItems = [
  { href: "#about", label: "About" },
  { href: "#method", label: "Method" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#index", label: "Index" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

type Category = "ALL" | Domain;

const projectFilters: Array<{ key: Category; label: string }> = [
  { key: "ALL", label: "All systems" },
  { key: "OPERATIONS", label: "Operations" },
  { key: "AUTOMATION", label: "Automation" },
  { key: "AI", label: "AI" },
  { key: "DATA", label: "Data" },
  { key: "RESEARCH", label: "Research" },
];

/**
 * The record excludes the three built systems: they already have full feature
 * rows above, and repeating them here was what made eighteen projects read as
 * twenty-six impressions.
 */
const recordProjects = [...featuredProjects, ...projectArchive];

/** Group order — the progression the section claims to show. */
const recordGroups = Array.from(new Set(recordProjects.map((project) => project.group)));

/** How many systems fall under a filter. "ALL" counts everything. */
function countIn(category: Category): number {
  if (category === "ALL") return recordProjects.length;
  return recordProjects.filter((item) => item.domains.includes(category)).length;
}

/** Reveals children once on first intersection. No-ops under reduced motion via CSS. */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`ref-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function EvidenceBadge({ project }: { project: Project }) {
  const { label, note } = evidenceLabels[project.evidence];
  return (
    <span className={`ref-evidence ref-evidence-${project.evidence}`} title={note}>
      {project.evidence === "code" ? <FileCode2 size={11} aria-hidden="true" /> : null}
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------
 * Method — the section the whole page rests on.
 *
 * Selecting a stage shows that same stage applied in three unrelated problem
 * spaces side by side. The repetition across domains is the argument; asserting
 * "same approach" in prose would not be.
 * ----------------------------------------------------------------------- */
function MethodSection() {
  const [active, setActive] = useState(0);
  const stage = methodStages[active];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Roving-tabindex arrow-key navigation, per the WAI-ARIA tabs pattern.
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const last = methodStages.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }, [active]);

  return (
    <section id="method" className="ref-method ref-section">
      <div className="ref-section-heading">
        <div>
          <div className="ref-kicker">02 / THE METHOD</div>
          <h2>
            Different problems.
            <br />
            <em>Same approach.</em>
          </h2>
        </div>
        <p>
          Eight stages, run in a loop. Select any stage to see it applied across three unrelated problems — an
          operations backlog, an AI workflow, a data-quality failure. The domain changes; the stage does not.
        </p>
      </div>

      <div className="ref-method-loop" role="tablist" aria-label="Method stages" onKeyDown={onKeyDown}>
        {methodStages.map((item, index) => (
          <button
            key={item.number}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`method-tab-${item.number}`}
            aria-selected={active === index}
            aria-controls={`method-panel-${item.number}`}
            tabIndex={active === index ? 0 : -1}
            className={`ref-method-node ${active === index ? "is-active" : ""} ${index < active ? "is-past" : ""}`}
            onClick={() => setActive(index)}
          >
            <i>{item.number}</i>
            <span>{item.name}</span>
          </button>
        ))}
        <span className="ref-method-return" aria-hidden="true">
          <RotateCw size={13} /> loops
        </span>
      </div>

      <div
        className="ref-method-panel"
        role="tabpanel"
        id={`method-panel-${stage.number}`}
        aria-labelledby={`method-tab-${stage.number}`}
        tabIndex={-1}
        key={stage.number}
      >
        <div className="ref-method-lead">
          <span className="ref-method-stage">STAGE {stage.number} / 08</span>
          <h3>{stage.question}</h3>
          <p>{stage.body}</p>
        </div>
        <div className="ref-method-instances">
          <div className="ref-method-instances-label">
            <Workflow size={13} aria-hidden="true" /> The same stage, three different problems
          </div>
          {stage.instances.map((instance) => (
            <article key={instance.project} className="ref-method-instance">
              <header>
                <span>{instance.domain}</span>
                <strong>{instance.project}</strong>
              </header>
              <p>{instance.what}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * Shipped software — full feature rows, alternating sides.
 *
 * This is the strongest work on the page, so each system gets the product
 * treatment: a stat strip of source-checkable numbers, the three sharpest
 * verifiable claims, and its live pipeline running inside the same
 * application-window chrome the demos use — one visual language from card to
 * demo to case file.
 * ----------------------------------------------------------------------- */
function BuiltSystemFeature({ project, flipped }: { project: Project; flipped: boolean }) {
  const demoPath = demoPathFor(project.kind);
  return (
    <article className={`ref-feature ref-card-${project.accent} ${flipped ? "is-flipped" : ""}`}>
      <div className="ref-feature-copy">
        <div className="ref-feature-kicker">
          <span>
            {project.number} / {project.subtitle}
          </span>
          <EvidenceBadge project={project} />
        </div>
        <h3>{project.title}</h3>
        <p className="ref-feature-summary">{project.summary}</p>

        {project.stats ? (
          <dl className="ref-feature-stats">
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {project.verifiable ? (
          <ul className="ref-feature-checks">
            {project.verifiable.slice(0, 3).map((fact) => (
              <li key={fact}>
                <Check size={13} aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="ref-feature-foot">
          <div className="ref-project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="ref-feature-actions">
            {demoPath ? (
              <Link className="ref-button ref-button-accent" href={demoPath}>
                Run the live demo <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
            {/* Routed through wouter so the deployment base path applies. */}
            <Link className="ref-text-link" href={`/system/${slugFor(project.title)}`}>
              Case file <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="ref-feature-stage">
        <AppWindow name={`${project.title} — live model`}>
          <div className="ref-feature-sim">
            <SystemSimulation
              spec={simulationFor(project.kind, project.flow, project.accent)}
              label={`${project.title} pipeline`}
            />
          </div>
        </AppWindow>
      </div>
    </article>
  );
}

export default function ReferenceHome() {
  useDocumentMeta({
    title: "",
    description:
      "I build the systems behind complex work — operations, automation, AI, data and computational workflows. Different problems. Same approach.",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceKey>("operations");
  const [activeProject, setActiveProject] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [copied, setCopied] = useState(false);
  const activeSection = useActiveSection(navSectionIds);

  const service = services.find((item) => item.key === activeService) ?? services[0];
  const project = featuredProjects[activeProject];
  const visibleProjects = recordProjects.filter(
    (item) => activeCategory === "ALL" || item.domains.includes(activeCategory)
  );
  const closeMenu = () => setMenuOpen(false);

  /** Selecting a different case file resets the flow rail to its first stage. */
  const selectProject = (index: number) => {
    setActiveProject(index);
    setActiveStep(0);
  };

  /** Roving-tabindex arrow keys for the case-file picker, per the tabs pattern. */
  const onFileKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = featuredProjects.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    selectProject(next);
    document.getElementById(`file-tab-${featuredProjects[next].number}`)?.focus();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission). The adjacent
      // mailto link is always present, so no fallback UI is needed.
    }
  };

  return (
    <div className="reference-page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="reference-header">
        <a className="reference-brand" href="#top" onClick={closeMenu}>
          <span className="reference-brand-mark">AS</span>
          <span>
            <strong>Abdelrhman Shoman</strong>
            <small>Systems Builder</small>
          </span>
        </a>
        <nav id="primary-nav" className={menuOpen ? "is-open" : ""} aria-label="Primary">
          {navItems.map((item) => {
            const current = item.href.slice(1) === activeSection;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                // Announced to screen readers and styled for everyone else by
                // the same attribute, so the two can never disagree.
                aria-current={current ? "true" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        {/* Grouped so the header stays a three-column grid. */}
        <div className="reference-header-actions">
          <button
            type="button"
            className="reference-header-search"
            onClick={openCommandPalette}
            aria-label="Jump to a system, demo or section"
          >
            <Search size={13} aria-hidden="true" /> JUMP TO <kbd>&#8984;K</kbd>
          </button>
          <ThemeToggle />
          <a className="reference-header-cta" href="#contact">
            Let&rsquo;s talk <ArrowUpRight size={14} />
          </a>
        </div>
        <button
          className="reference-menu"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <main id="main">
        <section id="top" className="ref-hero ref-section">
          <div className="ref-hero-copy">
            <div className="ref-hello">
              Hello, I&rsquo;m <span>Abdelrhman</span> <Sparkles size={14} aria-hidden="true" />
            </div>
            <h1>
              I build
              <br />
              <em>systems.</em>
            </h1>
            <p>
              I design and build the structures behind complex work — operations, automation, AI, data and
              computational workflows. The domain changes. The approach doesn&rsquo;t.
            </p>
            <div className="ref-hero-actions">
              <a className="ref-button ref-button-accent" href="#work">
                See the work <ArrowUpRight size={15} />
              </a>
              <a className="ref-text-link" href="#method">
                Start with the method <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="ref-hero-side">
            <HeroSystem />

            <div className="ref-hero-note">
              <span>01 / POSITION</span>
              <strong>
                Complexity is rarely solved
                <br />
                <em>by adding more tools.</em>
              </strong>
              <p>From pharmacy and research through operations, automation and AI — the loop is the work.</p>
            </div>
          </div>

          {/* Each figure below is checkable on this page: counts, not claims. */}
          <div className="ref-hero-stats">
            <span>
              <b>{builtSystems.length}</b> applications with source you can read
            </span>
            <span>
              <b>{demos.length}</b> live demos you can run right here
            </span>
            <span>
              <b>{allProjects.length}</b> systems documented in the index
            </span>
            <span>
              <b>{methodStages.length}</b> stages in the method, run as a loop
            </span>
          </div>
        </section>

        <section id="about" className="ref-intro ref-section">
          <div className="ref-kicker">01 / THE BUILDER</div>
          <div className="ref-intro-grid">
            <h2>
              I&rsquo;m interested in
              <br />
              <em>the smallest system</em>
              <br />
              that creates clarity.
            </h2>
            <div>
              <p>
                I work in the space between a messy process and a useful operating picture. My background moves
                from pharmacy and research into computation, operations, automation and AI.
              </p>
              <p>
                Adding software to a process nobody understands only makes the wrong outcome arrive faster. So I
                understand the work first, map where it actually breaks, build the smallest coherent system, and
                keep the learning that comes back out of it.
              </p>
              <a className="ref-text-link" href="#method">
                See how that runs in practice <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <MethodSection />

        <section id="services" className="ref-dark-section ref-section">
          <div className="ref-dark-heading">
            <div>
              <div className="ref-kicker ref-kicker-light">03 / WHAT I DO</div>
              <h2>
                Tools are the layer.
                <br />
                <em>Systems are the skill.</em>
              </h2>
            </div>
            <p>The work starts before the software. Select a domain to see the kind of system I make visible.</p>
          </div>
          <div className="ref-service-layout">
            <div className="ref-service-list">
              {services.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`ref-service-tab ${activeService === item.key ? "is-active" : ""}`}
                  aria-pressed={activeService === item.key}
                  onClick={() => setActiveService(item.key)}
                >
                  <span>{item.short}</span>
                  <strong>{item.label}</strong>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="ref-service-detail" key={service.key}>
              <div className="ref-service-detail-top">
                <span>ACTIVE SYSTEM / {service.short}</span>
                <i /> <span>READOUT</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              <div className="ref-tool-list">
                {service.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
              <div className="ref-service-loop">
                <Workflow size={16} aria-hidden="true" />
                <span>Understand → Map → Build → Improve</span>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="ref-work ref-section">
          <div className="ref-section-heading">
            <div>
              <div className="ref-kicker">04 / BUILT SOFTWARE</div>
              <h2>
                Systems you can
                <br />
                <em>read the source of.</em>
              </h2>
            </div>
            <p>
              Three full applications — role-aware authorization, persistent state, audit trails and automated
              tests. Everything claimed below is checkable in the code rather than asserted here.
            </p>
          </div>

          {/* Every demo, one strip — the fastest route to proof. */}
          <div className="ref-demo-strip" role="navigation" aria-label="Live demos">
            <span className="ref-demo-strip-label">
              <Play size={12} aria-hidden="true" /> {demos.length} LIVE DEMOS
            </span>
            {demos.map((demo) => (
              <Link key={demo.slug} href={`/demo/${demo.slug}`}>
                {demo.title}
              </Link>
            ))}
          </div>

          <aside className="ref-shared-core">
            <div className="ref-shared-core-copy">
              <span className="ref-kicker">THE SAME CORE, THREE TIMES</span>
              <p>
                These three products solve unrelated problems, and underneath they run the same{" "}
                <strong>{sharedCore.lines} lines</strong> — {sharedCore.claim.split(" — ")[0]} — {" "}
                <strong>byte-identical</strong> in all {sharedCore.appCount}. Different problems, same
                approach, stated where it can be checked with a checksum rather than taken on trust.
              </p>
            </div>
            <ul className="ref-shared-core-files">
              {sharedCore.files.map((file) => (
                <li key={file}>
                  <span>{sharedCore.path}</span>
                  {file}
                </li>
              ))}
            </ul>
          </aside>

          <div className="ref-feature-list">
            {builtSystems.map((item, index) => (
              <Reveal key={item.number}>
                <BuiltSystemFeature project={item} flipped={index % 2 === 1} />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="case-files" className="ref-work ref-section ref-work-secondary">
          <div className="ref-section-heading">
            <div>
              <div className="ref-kicker">05 / OPERATIONAL CASE FILES</div>
              <h2>
                Work that ran
                <br />
                <em>inside organizations.</em>
              </h2>
            </div>
            <p>
              Systems built inside operating companies, where the output was a working process rather than a
              public repository. Figures here are reported by the operator, and labelled as such.
            </p>
          </div>

          {/* One selector, one panel. Five full cards — each running its own
              simulation — competed with the built-software rows above and made
              eighteen projects feel like twenty-six. */}
          <div className="ref-file-picker" role="tablist" aria-label="Operational case files">
            {featuredProjects.map((item, index) => (
              <button
                key={item.number}
                type="button"
                role="tab"
                id={`file-tab-${item.number}`}
                aria-selected={activeProject === index}
                aria-controls="file-panel"
                tabIndex={activeProject === index ? 0 : -1}
                className={`ref-file-tab ${activeProject === index ? "is-active" : ""} ref-card-${item.accent}`}
                onClick={() => selectProject(index)}
                onKeyDown={(event) => onFileKeyDown(event, index)}
              >
                <i>{item.number}</i>
                <span>
                  <b>{item.title}</b>
                  <small>{item.subtitle}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="ref-file-panel" id="file-panel" role="tabpanel" aria-labelledby={`file-tab-${project.number}`} key={project.number}>
            <div className="ref-file-copy">
              <div className="ref-file-head">
                <EvidenceBadge project={project} />
                <span>{project.group}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="ref-file-summary">{project.summary}</p>

              <div className="ref-inspector-flow" role="group" aria-label={`${project.title} stages`}>
                {project.flow.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    className={index === activeStep ? "is-active" : index < activeStep ? "is-past" : ""}
                    onClick={() => setActiveStep(index)}
                    aria-pressed={index === activeStep}
                  >
                    <i>{String(index + 1).padStart(2, "0")}</i>
                    {step}
                    {index < project.flow.length - 1 && <b aria-hidden="true">→</b>}
                  </button>
                ))}
              </div>

              <p className="ref-inspector-step">
                <span>STAGE {String(activeStep + 1).padStart(2, "0")}</span>
                {simulationFor(project.kind, project.flow, project.accent).stages[activeStep]?.detail}
              </p>

              {project.result ? <p className="ref-file-result">{project.result}</p> : null}

              <div className="ref-file-actions">
                {demoPathFor(project.kind) ? (
                  <Link className="ref-button ref-button-accent" href={demoPathFor(project.kind)!}>
                    Run the live demo <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                ) : null}
                {project.repo ? (
                  <a className="ref-text-link" href={project.repo} target="_blank" rel="noreferrer">
                    Repository <Github size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="demo-hint">Internal system — no public repository</span>
                )}
              </div>
            </div>

            <div className="ref-file-stage">
              <AppWindow name={`${project.title} — live model`}>
                <div className="ref-feature-sim">
                  <SystemSimulation
                    spec={simulationFor(project.kind, project.flow, project.accent)}
                    label={`${project.title} pipeline`}
                  />
                </div>
              </AppWindow>
            </div>
          </div>
        </section>

        <section id="index" className="ref-project-index ref-section">
          <div className="ref-section-heading">
            <div>
              <div className="ref-kicker">06 / THE REST OF THE RECORD</div>
              <h2>
                The range behind
                <br />
                <em>the three.</em>
              </h2>
            </div>
            <p>
              The systems above get the space because they are the strongest evidence. These are the rest —
              grouped by what they were for, so the progression from infrastructure to organizational control
              to AI is readable at a glance rather than buried in a wall of cards.
            </p>
          </div>

          <div className="ref-index-toolbar">
            <div className="ref-filter-list" role="group" aria-label="Filter by domain">
              {projectFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`ref-filter-button ${activeCategory === filter.key ? "is-active" : ""}`}
                  aria-pressed={activeCategory === filter.key}
                  onClick={() => setActiveCategory(filter.key)}
                >
                  {filter.label}
                  <span>{countIn(filter.key)}</span>
                </button>
              ))}
            </div>
            <span className="ref-index-status" aria-live="polite">
              {visibleProjects.length} of {recordProjects.length} shown
            </span>
          </div>

          {/* Grouped rows, not cards. Eighteen 280px cards read as a wall and
              buried the three that matter; the same information as one line
              each fits in the height of two of them. */}
          <div className="ref-record">
            {recordGroups.map((group) => {
              const rows = visibleProjects.filter((item) => item.group === group);
              if (rows.length === 0) return null;
              return (
                <section key={group} className="ref-record-group" aria-label={group}>
                  <h3>
                    {group}
                    <i>{rows.length}</i>
                  </h3>
                  <ul>
                    {rows.map((item) => (
                      <li key={item.number} className={`ref-record-row ref-card-${item.accent}`}>
                        <span className="ref-record-num">{item.number}</span>
                        <span className="ref-record-body">
                          <b>{item.title}</b>
                          <small>{item.summary}</small>
                        </span>
                        <span className="ref-record-meta">
                          <EvidenceBadge project={item} />
                          {item.result ? <em>{item.result.replace(/^Reported: /, "")}</em> : null}
                          <span className="ref-record-links">
                            {demoPathFor(item.kind) ? (
                              <Link href={demoPathFor(item.kind)!}>Demo →</Link>
                            ) : null}
                            {item.repo ? (
                              <a href={item.repo} target="_blank" rel="noreferrer">
                                Source →
                              </a>
                            ) : null}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <p className="ref-index-note">
            Every line is labelled by evidence tier in the same way as the work above: {builtSystems.length}{" "}
            applications have readable source, and the rest are outcomes reported by the organizations they ran
            inside. Nothing here is presented as more than it is.
          </p>
        </section>

        <section id="experience" className="ref-experience ref-section">
          <div className="ref-section-heading">
            <div>
              <div className="ref-kicker">07 / THE PROGRESSION</div>
              <h2>
                From pharmacy
                <br />
                <em>to systems.</em>
              </h2>
            </div>
            <p>
              Each chapter added a layer: evidence, computation, coordination, automation, intelligence — and the
              need to make the whole loop understandable to someone else.
            </p>
          </div>
          <div className="ref-timeline">
            {experiences.map((item) => (
              <article key={item.number} className={`ref-timeline-item ref-timeline-${item.accent}`}>
                <div className="ref-timeline-mark">
                  <span>{item.number}</span>
                  <i />
                </div>
                <div className="ref-timeline-copy">
                  <span>{item.role}</span>
                  <h3>{item.name}</h3>
                  <p>{item.body}</p>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="ref-proof ref-section">
          <div className="ref-proof-top">
            <div className="ref-kicker ref-kicker-light">08 / HOW I PRESENT WORK</div>
            <span>NO TESTIMONIALS / EVIDENCE FIRST</span>
          </div>
          <div className="ref-proof-grid">
            <h2>
              Labelled honestly.
              <br />
              <em>Or not claimed.</em>
            </h2>
            <div>
              <p>
                There are no testimonials on this site and no unattributed metrics. Work is either shipped
                software you can read, a demo you can run here, or an outcome reported by the organization it
                ran inside — and each card says which.
              </p>
              <div className="ref-proof-pills">
                <span>PHARMACY</span>
                <span>RESEARCH</span>
                <span>OPERATIONS</span>
                <span>AUTOMATION</span>
                <span>AI</span>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="ref-contact ref-section">
          <div className="ref-kicker">09 / CONTACT</div>
          <div className="ref-contact-grid">
            <div>
              <h2>
                Have a complex
                <br />
                <em>problem?</em>
              </h2>
              <p>
                Tell me what keeps going wrong and who it costs. Understanding the work comes before deciding
                what to build.
              </p>
              <a
                className="ref-button ref-button-accent"
                href={`mailto:${contact.email}?subject=${encodeURIComponent("A complex problem")}`}
              >
                Start a conversation <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div className="ref-contact-card">
              <span>{contact.availability.toUpperCase()}</span>
              <strong>{contact.location}</strong>
              <div className="ref-contact-lines">
                <a href={`mailto:${contact.email}`}>
                  <Mail size={14} aria-hidden="true" /> {contact.email}
                </a>
                <a href={contact.github} target="_blank" rel="noreferrer">
                  <Github size={14} aria-hidden="true" /> {contact.githubHandle}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
                {contact.linkedin ? (
                  <a href={contact.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin size={14} aria-hidden="true" /> LinkedIn
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                ) : null}
                {contact.cv ? (
                  <Link href={contact.cv}>
                    <FileDown size={14} aria-hidden="true" /> Curriculum vitae
                  </Link>
                ) : null}
              </div>
              <button type="button" className="ref-copy-button" onClick={copyEmail}>
                {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copied ? "Email copied" : "Copy email address"}
              </button>
              <span className="ref-copy-live" role="status" aria-live="polite">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="ref-footer">
        <span>ABDELRHMAN SHOMAN / SYSTEMS BUILDER</span>
        <span>DIFFERENT PROBLEMS. SAME APPROACH.</span>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </footer>
    </div>
  );
}
