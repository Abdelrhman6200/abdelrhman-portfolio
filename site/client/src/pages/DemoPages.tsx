/*
 * In-site project demos: dark command surfaces, paper workspaces, sage state signals,
 * and explicit simulation labels keep the portfolio demos useful without implying
 * production credentials, payments, or file exports. Handoff rails replay an
 * input → transform → output pulse whenever the user changes the system state.
 */
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Database, ExternalLink, FileDown, FileSpreadsheet, LockKeyhole, Play, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import "../editorial.css";
import "../reference-demo.css";

type DemoKind = "cgf" | "questionnaire" | "session-links" | "excel-validation";

const cgfStages = ["LANDING", "CHECKOUT", "ENROLLMENT", "DASHBOARD", "CONTENT"];
const questionnaireStages = ["QUESTIONNAIRE", "VALIDATION", "TEMPLATE", "PPTX", "PDF"];

function DemoHeader({ kind }: { kind: DemoKind }) {
  const isCgf = kind === "cgf";
  const isSessionLinks = kind === "session-links";
  const isValidation = kind === "excel-validation";
  const label = isCgf ? "CGF" : kind === "questionnaire" ? "REPORT TOOL" : isSessionLinks ? "SESSION RUNNER" : "EXCEL VALIDATION";
  const source = isCgf ? "https://github.com/Abdelrhman6200/CGF" : kind === "questionnaire" ? "https://github.com/Abdelrhman6200/question-template-fill" : undefined;
  return (
    <header className="demo-nav">
      <a href="/#case-files" className="demo-back"><ArrowLeft size={15} /> BACK TO PROJECTS</a>
      <span className="demo-nav-status"><b>SYSTEM // 001</b><i /> IN-SITE DEMO / {label}</span>
      {source ? <a className="demo-source" href={source} target="_blank" rel="noreferrer">SOURCE <ExternalLink size={13} /></a> : <span className="demo-source demo-source-muted">{isValidation ? "SUPPLIED BRIEF" : "SUPPLIED PROJECT"}</span>}
    </header>
  );
}

function DemoHandoff({ activeStage, totalStages, pulse = 0, status }: { activeStage: number; totalStages: number; pulse?: number; status: string }) {
  const stateIndex = Math.min(2, Math.max(0, Math.round((activeStage / Math.max(totalStages - 1, 1)) * 2)));
  const states = ["INPUT", "TRANSFORM", "OUTPUT"];
  return <div key={`handoff-${activeStage}-${pulse}`} className={`demo-handoff handoff-state-${stateIndex} ${pulse > 0 ? "is-pulsing" : ""}`} aria-live="polite"><Tooltip><TooltipTrigger asChild><button type="button" className="demo-handoff-label" aria-label="Explain the live handoff trace">TRACE / LIVE</button></TooltipTrigger><TooltipContent side="bottom" sideOffset={8}>The rail shows where this interaction sits in the system: input, transformation, or output.</TooltipContent></Tooltip><div className="demo-handoff-rail">{states.map((state, index) => <span className={index === stateIndex ? "is-active" : index < stateIndex ? "is-complete" : ""} key={state}><i />{state}{index < states.length - 1 && <ArrowRight aria-hidden="true" />}</span>)}</div><small>{status} / LOCAL SIMULATION</small></div>;
}

function DemoHint({ children, label, side = "top" }: { children: React.ReactNode; label: string; side?: "top" | "right" | "bottom" | "left" }) {
  return <Tooltip><TooltipTrigger asChild><span className="demo-hint-anchor" tabIndex={0} aria-label={label}>?</span></TooltipTrigger><TooltipContent side={side} sideOffset={7}>{children}</TooltipContent></Tooltip>;
}

function DemoFlow({ active, stages, pulse, status }: { active: number; stages: string[]; pulse?: number; status: string }) {
  return <><div className="demo-flow" aria-label="Demo architecture flow">{stages.map((stage, index) => <div className={`demo-flow-step ${index === active ? "is-active" : ""} ${index < active ? "is-complete" : ""}`} key={stage}><span>{String(index + 1).padStart(2, "0")}</span><b>{stage}</b>{index < stages.length - 1 && <ArrowRight aria-hidden="true" />}</div>)}</div><DemoHandoff activeStage={active} totalStages={stages.length} pulse={pulse} status={status} /></>;
}

function DemoPanel({ children, title, eyebrow, icon, hint }: { children: React.ReactNode; title: string; eyebrow: string; icon: React.ReactNode; hint?: string }) {
  const tooltipCopy = hint ?? "Inspect this local simulation surface to see how the system changes state.";
  return <section className="demo-panel"><div className="demo-panel-head"><span className="demo-eyebrow">{eyebrow}<DemoHint label={`Explain ${eyebrow}`}>{tooltipCopy}</DemoHint></span><span className="demo-panel-icon">{icon}</span></div><h2>{title}</h2>{children}</section>;
}

export function CGFoundryDemo() {
  const [stage, setStage] = useState(0);
  const [plan, setPlan] = useState<"FOUNDATION" | "ADVANCED">("FOUNDATION");
  const [message, setMessage] = useState("Select an enrollment path to inspect the event handoff.");
  const [handoffPulse, setHandoffPulse] = useState(0);

  const advance = () => {
    const next = Math.min(stage + 1, cgfStages.length - 1);
    setStage(next);
    setHandoffPulse((pulse) => pulse + 1);
    setMessage(next === 1 ? "Checkout surface ready. No payment is processed in this portfolio demo." : next === 2 ? "Webhook event received. Account and access state are now visible." : next === 3 ? "Learner dashboard opened with protected content state." : next === 4 ? "Content gate active. This is the final inspectable state." : "Enrollment path selected. Continue to trace the system.");
  };

  return <div className="demo-page reference-demo"><DemoHeader kind="cgf" /><main className="demo-shell"><div className="demo-topline"><span>PROJECT 01 / EDUCATION PRODUCT SYSTEM</span><span>CGF / ENROLLMENT TRACE</span></div><div className="demo-heading"><div><p className="eyebrow">IN-SITE BUILD / INSPECTABLE SIMULATION</p><h1>Enrollment is<br /><em>a system.</em></h1></div><p className="demo-intro">Trace how a learning product moves from a public offer through payment intent, account creation, access control and protected content. Every action below is a local UI simulation.</p></div><DemoFlow active={stage} stages={cgfStages} pulse={handoffPulse} status={stage === 0 ? `${plan} PATH READY` : "EVENT HANDOFF ACTIVE"} /><div className="demo-grid"><DemoPanel eyebrow="01 / SELECT PATH" title="Choose the operating state." icon={<Play size={17} />}><p className="demo-copy">The product surface begins with a clear offer and a deliberate next step. Select a plan to set the enrollment context.</p><div className="demo-plan-grid">{(["FOUNDATION", "ADVANCED"] as const).map((item) => <button className={`demo-choice ${plan === item ? "is-selected" : ""}`} key={item} type="button" onClick={() => { setPlan(item); setHandoffPulse((pulse) => pulse + 1); setMessage(`${item} path selected. The system is ready to enter checkout.`); }}><span>{item === "FOUNDATION" ? "01" : "02"}</span><strong>{item}</strong><small>{item === "FOUNDATION" ? "Core access / 4 modules" : "Full access / 8 modules"}</small></button>)}</div><button className="demo-button" type="button" onClick={advance}>ENTER CHECKOUT <ArrowRight size={15} /></button></DemoPanel><DemoPanel eyebrow="02 / ACTIVE HANDOFF" title={cgfStages[stage]} icon={<ActivityIcon stage={stage} />}><div className="demo-state-card"><div className="demo-state-top"><span>STATE / {String(stage + 1).padStart(2, "0")}</span><span className="demo-live"><i /> SIMULATED</span></div><strong>{stage === 0 ? "Public offer" : stage === 1 ? "Checkout intent" : stage === 2 ? "Enrollment record" : stage === 3 ? "Learner dashboard" : "Protected content"}</strong><p>{message}</p></div><div className="demo-event-list"><div><span>EVENT</span><b>{stage === 0 ? "OFFER_VIEWED" : stage === 1 ? "CHECKOUT_STARTED" : stage === 2 ? "PAYMENT_CONFIRMED" : stage === 3 ? "ACCESS_GRANTED" : "CONTENT_REQUESTED"}</b></div><div><span>OWNER</span><b>{stage < 2 ? "PROSPECT" : stage === 2 ? "WEBHOOK" : "LEARNER"}</b></div><div><span>NEXT</span><b>{stage === cgfStages.length - 1 ? "IMPROVE LOOP" : cgfStages[stage + 1]}</b></div></div><button className="demo-button secondary" type="button" onClick={advance} disabled={stage === cgfStages.length - 1}>{stage === cgfStages.length - 1 ? "TRACE COMPLETE" : "ADVANCE EVENT"} <ArrowRight size={15} /></button></DemoPanel></div><div className="demo-log"><div><span className="demo-eyebrow">ARCHITECTURE NOTE</span><p>Payment is only one event. The useful system is the contract between event, identity, permission, content and exception handling.</p></div><div className="demo-log-track"><span>PLAN / {plan}</span><span>STATE / {cgfStages[stage]}</span><span>ACCESS / {stage >= 2 ? "READY" : "WAITING"}</span></div></div></main></div>;
}

function ActivityIcon({ stage }: { stage: number }) {
  return stage >= 2 ? <ShieldCheck size={17} /> : stage === 1 ? <LockKeyhole size={17} /> : <Play size={17} />;
}

export function QuestionnaireDemo() {
  const [studentName, setStudentName] = useState("Mariam Hassan");
  const [courseTitle, setCourseTitle] = useState("Systems Thinking Lab");
  const [includePicture, setIncludePicture] = useState(true);
  const [stage, setStage] = useState(0);
  const [exportState, setExportState] = useState("READY TO BUILD");
  const [handoffPulse, setHandoffPulse] = useState(0);
  const [inputDirty, setInputDirty] = useState(false);

  const buildReport = () => { setStage(2); setExportState("REPORT PREVIEW READY"); setInputDirty(false); setHandoffPulse((pulse) => pulse + 1); };
  const simulateExport = (format: "PPTX" | "PDF") => { setStage(format === "PPTX" ? 3 : 4); setExportState(`${format} EXPORT SIMULATED`); setHandoffPulse((pulse) => pulse + 1); };

      return <div className="demo-page reference-demo"><DemoHeader kind="questionnaire" /><main className="demo-shell"><div className="demo-topline"><span>PROJECT 02 / DOCUMENT AUTOMATION</span><span>QUESTIONNAIRE / REPORT TRACE</span></div><div className="demo-heading"><div><p className="eyebrow">IN-SITE BUILD / FORM TO OUTPUT</p><h1>Shape the input.<br /><em>Keep the work.</em></h1></div><p className="demo-intro">A small report workflow: capture structured answers, validate the shape, merge a template and expose the export surface. Nothing is downloaded here; the demo makes the conversion logic visible.</p></div><DemoFlow active={stage} stages={questionnaireStages} pulse={handoffPulse} status={inputDirty ? "INPUT EDITING" : stage >= 2 ? "OUTPUT READY" : "INPUT READY"} /><div className="demo-grid questionnaire-grid"><DemoPanel eyebrow="01 / STRUCTURED INPUT" title="Build the questionnaire." icon={<UserRound size={17} />}><div className="demo-form"><label className="demo-field"><span>STUDENT NAME</span><input value={studentName} onChange={(event) => { setStudentName(event.target.value); setInputDirty(true); setHandoffPulse((pulse) => pulse + 1); }} /></label><label className="demo-field"><span>COURSE / WORKSHOP</span><input value={courseTitle} onChange={(event) => { setCourseTitle(event.target.value); setInputDirty(true); setHandoffPulse((pulse) => pulse + 1); }} /></label><label className="demo-check"><input type="checkbox" checked={includePicture} onChange={(event) => { setIncludePicture(event.target.checked); setInputDirty(true); setHandoffPulse((pulse) => pulse + 1); }} /><span>Include student picture placeholder</span></label></div><button className="demo-button" type="button" onClick={buildReport}>VALIDATE + BUILD <ArrowRight size={15} /></button></DemoPanel><DemoPanel eyebrow="02 / REPORT SURFACE" title="Preview the output." icon={<FileDown size={17} />}><div className="demo-report-preview"><div className="demo-preview-head"><span>REPORT / 001</span><span>{exportState}</span></div><div className="demo-preview-sheet"><div className="demo-preview-logo">AS</div><div><span className="demo-preview-kicker">LEARNING RECORD</span><h3>{studentName || "Student name"}</h3><p>{courseTitle || "Course title"}</p></div>{includePicture && <div className="demo-picture"><UserRound size={20} /></div>}<div className="demo-preview-rule" /><div className="demo-preview-row"><span>INPUT</span><b>{stage >= 1 ? "VALIDATED" : "WAITING"}</b></div><div className="demo-preview-row"><span>TEMPLATE</span><b>{stage >= 2 ? "MERGED" : "READY"}</b></div><div className="demo-preview-row"><span>OUTPUT</span><b>{stage >= 3 ? "PPTX" : stage >= 4 ? "PDF" : "SELECT FORMAT"}</b></div></div></div><div className="demo-export-actions"><button className="demo-button secondary" type="button" onClick={() => simulateExport("PPTX")} disabled={stage < 2}><span>EXPORT PPTX</span><ArrowRight size={14} /></button><button className="demo-button secondary" type="button" onClick={() => simulateExport("PDF")} disabled={stage < 2}><span>EXPORT PDF</span><ArrowRight size={14} /></button></div></DemoPanel></div><div className="demo-log"><div><span className="demo-eyebrow">AUTOMATION NOTE</span><p>The work stays recognisable because the system removes repetitive conversion, not the structure people already understand.</p></div><div className="demo-log-track"><span>INPUT / {studentName ? "PRESENT" : "EMPTY"}</span><span>PICTURE / {includePicture ? "OPTIONAL" : "OFF"}</span><span>OUTPUT / {exportState}</span></div></div><a href="/#work" className="demo-close"><RefreshCw size={14} /> RETURN TO PROJECTS</a></main></div>;
  }

export function SessionLinksDemo() {
  const stages = ["SESSION BRIEF", "TEAMS LINK", "NAMING", "DISTRIBUTE", "ATTENDANCE"];
  const [stage, setStage] = useState(0);
  const [area, setArea] = useState("NEW CAIRO");
  const [vendor, setVendor] = useState("ALMENTOR");
  const [pulse, setPulse] = useState(0);
  const advance = () => { setStage((value) => Math.min(value + 1, stages.length - 1)); setPulse((value) => value + 1); };
  const code = `${area.slice(0, 3)}-${vendor.slice(0, 3)}-001`;
  return <div className="demo-page reference-demo"><DemoHeader kind="session-links" /><main className="demo-shell"><div className="demo-topline"><span>PROJECT 01 / OPERATIONAL INFRASTRUCTURE</span><span>SESSION LINK / TRACE</span></div><div className="demo-heading"><div><p className="eyebrow">IN-SITE BUILD / LOCAL SIMULATION</p><h1>Make volume<br /><em>repeatable.</em></h1></div><p className="demo-intro">Inspect the handoff from a session brief to a named Microsoft Teams link, distributed session record and attendance connection. This demo shows the workflow shape without connecting to Microsoft 365.</p></div><DemoFlow active={stage} stages={stages} pulse={pulse} status={stage === 0 ? "SESSION INPUT READY" : "AUTOMATION HANDOFF ACTIVE"} /><div className="demo-grid"><DemoPanel eyebrow="01 / SESSION INPUT" title="Set the operating context." icon={<Database size={17} />}><div className="demo-form"><label className="demo-field"><span>AREA</span><select value={area} onChange={(event) => { setArea(event.target.value); setStage(0); setPulse((value) => value + 1); }}><option>NEW CAIRO</option><option>GIZA</option><option>ALEXANDRIA</option></select></label><label className="demo-field"><span>VENDOR</span><select value={vendor} onChange={(event) => { setVendor(event.target.value); setStage(0); setPulse((value) => value + 1); }}><option>ALMENTOR</option><option>ISKYTECH</option><option>PARTNER</option></select></label></div><div className="demo-log-track session-code-track"><span>SESSION CODE</span><b>{code}</b></div><button className="demo-button" type="button" onClick={advance} disabled={stage === stages.length - 1}>{stage === stages.length - 1 ? "TRACE COMPLETE" : "RUN NEXT HANDOFF"} <ArrowRight size={15} /></button></DemoPanel><DemoPanel eyebrow="02 / AUTOMATION STATE" title={stages[stage]} icon={<ClipboardCheck size={17} />}><div className="demo-state-card"><div className="demo-state-top"><span>STATE / {String(stage + 1).padStart(2, "0")}</span><span className="demo-live"><i /> SIMULATED</span></div><strong>{stage === 0 ? "Brief captured" : stage === 1 ? "Unique Teams link" : stage === 2 ? "Naming convention applied" : stage === 3 ? "Relevant people notified" : "Attendance connection ready"}</strong><p>{stage === 0 ? "The system is waiting for a session context." : "A local trace represents the next automated handoff in the operational workflow."}</p></div><div className="demo-event-list"><div><span>CHANNEL</span><b>MICROSOFT TEAMS</b></div><div><span>SESSION</span><b>{code}</b></div><div><span>NEXT</span><b>{stage === stages.length - 1 ? "IMPROVE LOOP" : stages[stage + 1]}</b></div></div><button className="demo-button secondary" type="button" onClick={advance} disabled={stage === stages.length - 1}>{stage === stages.length - 1 ? "TRACE COMPLETE" : "ADVANCE EVENT"} <ArrowRight size={15} /></button></DemoPanel></div><div className="demo-log"><div><span className="demo-eyebrow">OPERATIONS NOTE</span><p>The valuable part is not the meeting link. It is the repeatable contract between session identity, distribution and attendance.</p></div><div className="demo-log-track"><span>AREA / {area}</span><span>VENDOR / {vendor}</span><span>HANDOFF / {stages[stage]}</span></div></div><a href="/#work" className="demo-close"><RefreshCw size={14} /> RETURN TO PROJECTS</a></main></div>;
}

export function ExcelValidationDemo() {
  const stages = ["DATA ENTRY", "RULES", "EXCEPTIONS", "REVIEW", "CLEAN RECORD"];
  const [stage, setStage] = useState(0);
  const [pulse, setPulse] = useState(0);
  const rows = [{ label: "STUDENT ID", value: "ST-1042", status: stage >= 2 ? "PASS" : "READY" }, { label: "SCHEDULE", value: "THU / 17:00", status: stage >= 2 ? "REVIEW" : "READY" }, { label: "DUPLICATE CHECK", value: "NO MATCH", status: stage >= 2 ? "PASS" : "WAITING" }];
  const advance = () => { setStage((value) => Math.min(value + 1, stages.length - 1)); setPulse((value) => value + 1); };
  return <div className="demo-page reference-demo"><DemoHeader kind="excel-validation" /><main className="demo-shell"><div className="demo-topline"><span>PROJECT 02 / OPERATIONAL INFRASTRUCTURE</span><span>EXCEL VALIDATION / TRACE</span></div><div className="demo-heading"><div><p className="eyebrow">IN-SITE BUILD / LOCAL SIMULATION</p><h1>Make data<br /><em>answer back.</em></h1></div><p className="demo-intro">Inspect how a large operational dataset moves through custom validation rules, exception flags and staff review. The interface is a visual simulation of the control loop described in the project brief.</p></div><DemoFlow active={stage} stages={stages} pulse={pulse} status={stage === 0 ? "DATA READY" : stage === 2 ? "EXCEPTIONS FOUND" : "VALIDATION HANDOFF ACTIVE"} /><div className="demo-grid"><DemoPanel eyebrow="01 / RECORD SAMPLE" title="Run the validation layer." icon={<FileSpreadsheet size={17} />}><div className="demo-validation-table">{rows.map((row) => <div className="demo-validation-row" key={row.label}><div><span>{row.label}</span><b>{row.value}</b></div><strong className={`demo-validation-status ${row.status === "REVIEW" ? "is-review" : row.status === "PASS" ? "is-pass" : ""}`}>{row.status}</strong></div>)}</div><button className="demo-button" type="button" onClick={advance} disabled={stage === stages.length - 1}>{stage === stages.length - 1 ? "REVIEW COMPLETE" : "RUN NEXT RULE"} <ArrowRight size={15} /></button></DemoPanel><DemoPanel eyebrow="02 / EXCEPTION SURFACE" title="Review what needs attention." icon={<ClipboardCheck size={17} />}><div className="demo-state-card"><div className="demo-state-top"><span>CONTROL / {String(stage + 1).padStart(2, "0")}</span><span className="demo-live"><i /> SIMULATED</span></div><strong>{stage < 2 ? "Rules are waiting" : stage === 2 ? "One exception surfaced" : stage === 3 ? "Staff review active" : "Clean record"}</strong><p>{stage < 2 ? "Run the rule layer to convert raw entries into a reviewable state." : "The exception queue keeps the operator focused on records that need judgment."}</p></div><div className="demo-event-list"><div><span>RULES</span><b>{stage >= 1 ? "RUNNING" : "READY"}</b></div><div><span>EXCEPTIONS</span><b>{stage >= 2 ? "01 REVIEW" : "WAITING"}</b></div><div><span>NEXT</span><b>{stage === stages.length - 1 ? "IMPROVE LOOP" : stages[stage + 1]}</b></div></div><button className="demo-button secondary" type="button" onClick={advance} disabled={stage === stages.length - 1}>{stage === stages.length - 1 ? "TRACE COMPLETE" : "ADVANCE EVENT"} <ArrowRight size={15} /></button></DemoPanel></div><div className="demo-log"><div><span className="demo-eyebrow">DATA NOTE</span><p>The spreadsheet becomes a control surface when rules expose exceptions and staff can review the small set that matters.</p></div><div className="demo-log-track"><span>ROWS / 03 SAMPLE</span><span>RULES / {stage >= 1 ? "ACTIVE" : "READY"}</span><span>REVIEW / {stage >= 2 ? "OPEN" : "WAITING"}</span></div></div><a href="/#work" className="demo-close"><RefreshCw size={14} /> RETURN TO PROJECTS</a></main></div>;
}
