import { useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OpsRecord, OpsState, formatDate } from "@/lib/ops";

function Shell({ children }: { children: React.ReactNode }) {
  return <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-slate-700 bg-[#101827] shadow-[-22px_0_65px_rgba(0,0,0,0.45)]">{children}</aside>;
}

function Header({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold text-white">{title}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close detail"><X className="h-5 w-5" /></button></div>;
}

function WidgetPreview({ widgets, state }: { widgets: string[]; state: OpsState }) {
  const values: Record<string, { value: string; label: string }> = {
    "KPI status": { value: `${state.kpis.length}`, label: "governed KPIs" },
    "Capacity plan": { value: `${state.plans.length}`, label: "planning scenarios" },
    "Open incidents": { value: `${state.incidents.filter((item) => !["resolved", "closed"].includes(String(item.status))).length}`, label: "open incidents" },
    "Data health": { value: `${Math.round(state.quality.reduce((sum, item) => sum + Number(item.completeness || 0), 0) / Math.max(1, state.quality.length))}%`, label: "average completeness" },
    "Integration readiness": { value: `${state.integrations.filter((item) => item.readiness === "ready").length}/${state.integrations.length}`, label: "connectors ready" },
    "Automation follow-through": { value: `${state.actions.filter((item) => item.linkedType === "automations").length}`, label: "routed actions" },
  };
  return <div className="mt-4 grid gap-2 sm:grid-cols-2">{widgets.length ? widgets.map((widget) => <div key={widget} className="rounded-lg border border-cyan-400/15 bg-cyan-400/5 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">{widget}</p><p className="mt-2 text-xl font-semibold text-white">{values[widget]?.value || "—"}</p><p className="text-xs text-slate-500">{values[widget]?.label || "configured widget"}</p></div>) : <p className="col-span-2 rounded-lg border border-dashed border-slate-700 p-4 text-xs text-slate-500">Select widgets to compose this dashboard.</p>}</div>;
}

export function AnalyticsDrawer({ record, module, state, onClose, onUpdate }: { record: OpsRecord; module: "plans" | "dashboards" | "explorations"; state: OpsState; onClose: () => void; onUpdate: (entity: string, id: string, patch: Record<string, any>) => Promise<void> }) {
  const [widgets, setWidgets] = useState<string[]>(Array.isArray(record.widgets) ? record.widgets : String(record.widgets || "").split(",").map((item) => item.trim()).filter(Boolean));
  const [metric, setMetric] = useState(record.metric || state.kpis[0]?.name || "");
  const [dimensions, setDimensions] = useState(record.dimensions || "Cohort, programme, instructor load");
  const [scenarioId, setScenarioId] = useState(record.scenarioId || state.plans[0]?.id || "");
  const selectedKpi = state.kpis.find((kpi) => kpi.name === metric) || state.kpis[0];
  const selectedScenario = state.plans.find((plan) => plan.id === scenarioId) || state.plans[0];
  const capacity = state.plans.map((plan) => ({ name: plan.name, forecast: Number(String(plan.forecast || "0").match(/\d+/)?.[0] || 0), actual: Number(String(plan.actual || "0").match(/\d+/)?.[0] || 0) }));
  const selectedTrend = (selectedKpi?.actuals || []).map((point: any) => ({ date: point.date, actual: Number(point.actual || point.value || 0), target: Number(selectedKpi.target || 0) }));
  const scenarioTrend = selectedTrend.length ? selectedTrend : [{ date: selectedScenario?.horizon || "Scenario", actual: Number(String(selectedScenario?.actual || "0").match(/\d+/)?.[0] || 0), target: Number(String(selectedScenario?.forecast || selectedKpi?.target || "0").match(/\d+/)?.[0] || 0) }];
  const title = record.name || "Analytics asset";
  const availableWidgets = ["KPI status", "Capacity plan", "Open incidents", "Data health", "Integration readiness", "Automation follow-through"];
  const saveDashboard = async () => {
    try {
      await onUpdate("dashboards", record.id, { widgets, widgetLayout: widgets.map((widget, index) => ({ id: widget, position: index })) });
      toast.success("Dashboard composition saved and audited.");
      onClose();
    } catch (error: any) { toast.error(error.message || "Could not save dashboard composition."); }
  };
  const saveExploration = async () => {
    try {
      await onUpdate("explorations", record.id, { metric, dimensions, scenarioId, scope: selectedScenario?.name || record.scope, insight: `${metric} reviewed against ${selectedScenario?.name || "selected planning scenario"}.`, analysisState: { metric, dimensions, scenarioId } });
      toast.success("Exploration dimensions and scenario saved and audited.");
      onClose();
    } catch (error: any) { toast.error(error.message || "Could not save metric exploration."); }
  };
  return <Shell><Header eyebrow={module === "plans" ? "Scenario planning" : module === "dashboards" ? "Dashboard composition" : "Metric exploration"} title={title} onClose={onClose} /><div className="flex-1 space-y-5 overflow-y-auto px-6 py-5"><section className="rounded-xl border border-slate-800 bg-slate-950/25 p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-200" /><p className="text-sm font-semibold text-slate-100">{module === "explorations" ? `${selectedKpi?.name || metric} against ${selectedScenario?.name || "scenario"}` : "Forecast versus actual capacity"}</p></div><div className="mt-4 h-56">{module === "explorations" ? <ResponsiveContainer width="100%" height="100%"><LineChart data={scenarioTrend}><CartesianGrid strokeDasharray="3 3" stroke="#253247" /><XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} dot={false} name="Selected actual" /><Line type="monotone" dataKey="target" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Scenario target" /></LineChart></ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%"><BarChart data={capacity}><CartesianGrid strokeDasharray="3 3" stroke="#253247" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} /><Tooltip /><Legend /><Bar dataKey="forecast" fill="#22d3ee" name="Forecast" radius={[4, 4, 0, 0]} /><Bar dataKey="actual" fill="#818cf8" name="Actual" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>}</div></section><section className="rounded-xl border border-slate-800 bg-slate-950/25 p-4"><p className="text-sm font-semibold text-slate-100">Decision context</p>{module === "plans" ? <><p className="mt-2 text-xs text-slate-400">Assumptions: {record.assumptions || "Not recorded"}</p><p className="mt-2 text-xs text-slate-400">Forecast: {record.forecast || "Not recorded"}</p><p className="mt-2 text-xs text-slate-400">Actual: {record.actual || "Not recorded"}</p><p className="mt-2 text-xs text-slate-400">Variance: {record.variance || "Not recorded"}</p></> : module === "dashboards" ? <><p className="mt-2 text-xs text-slate-400">Audience: {record.audience || "Not recorded"}</p><div className="mt-3 grid grid-cols-2 gap-2">{availableWidgets.map((widget) => <label key={widget} className="flex items-center gap-2 rounded-lg border border-slate-800 p-2 text-xs text-slate-300"><input type="checkbox" checked={widgets.includes(widget)} onChange={() => setWidgets((current) => current.includes(widget) ? current.filter((item) => item !== widget) : [...current, widget])} />{widget}</label>)}</div><WidgetPreview widgets={widgets} state={state} /><Button onClick={saveDashboard} className="mt-3 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">Save widget composition</Button></> : <><label className="mt-3 block text-xs text-slate-400">Metric<select value={metric} onChange={(event) => setMetric(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-sm text-slate-100">{state.kpis.map((kpi) => <option key={kpi.id} value={kpi.name}>{kpi.name}</option>)}</select></label><label className="mt-3 block text-xs text-slate-400">Planning scenario<select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-sm text-slate-100">{state.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><label className="mt-3 block text-xs text-slate-400">Dimensions<input value={dimensions} onChange={(event) => setDimensions(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-sm text-slate-100" /></label><p className="mt-3 text-xs text-slate-400">Saved scenario: {selectedScenario?.name || "None"} · Forecast {selectedScenario?.forecast || "—"} · Actual {selectedScenario?.actual || "—"}</p><Button onClick={saveExploration} className="mt-3 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">Save exploration composition</Button></>}</section></div></Shell>;
}

export function ServiceReviewDrawer({ record, onClose, onUpdate }: { record: OpsRecord; onClose: () => void; onUpdate: (entity: string, id: string, patch: Record<string, any>) => Promise<void> }) {
  const [outcomes, setOutcomes] = useState(record.outcomes || "");
  const complete = async () => { if (!outcomes.trim()) { toast.error("Record review outcomes before completion."); return; } try { await onUpdate("serviceReviews", record.id, { status: "completed", outcomes }); toast.success("Service review outcomes saved and audited."); onClose(); } catch (error: any) { toast.error(error.message || "Could not complete the service review."); } };
  return <Shell><Header eyebrow="Structured service review" title={record.title || "Service review"} onClose={onClose} /><div className="flex-1 space-y-5 overflow-y-auto px-6 py-5"><section className="rounded-xl border border-slate-800 bg-slate-950/25 p-4"><div className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-cyan-200" /><p className="text-sm font-semibold text-slate-100">Review agenda and evidence</p></div><p className="mt-3 text-sm text-slate-300">{record.agenda || "No agenda recorded."}</p><p className="mt-2 text-xs text-slate-500">Period: {record.period || "Not specified"} · Due: {record.dueAt ? formatDate(record.dueAt) : "Not set"}</p></section><section className="rounded-xl border border-slate-800 bg-slate-950/25 p-4"><p className="text-sm font-semibold text-slate-100">Decision outcomes</p><Textarea value={outcomes} onChange={(event) => setOutcomes(event.target.value)} placeholder="Record decisions, risks, owners, and next actions" className="mt-3 min-h-32 border-slate-700 bg-slate-950 text-slate-100" /><Button onClick={complete} className="mt-3 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"><CheckCircle2 className="mr-2 h-4 w-4" />Complete service review</Button></section></div></Shell>;
}
