/*
 * EdTech Ops Intelligence — KPI monitoring, anomaly workflow and the audit
 * trail, re-implemented for the demo.
 *
 * Three properties of the real application are preserved exactly:
 *
 *   1. A KPI definition carries an explicit target, warning threshold and
 *      owner, so a miss has an address.
 *   2. An anomaly moves open -> investigating -> resolved, and resolution
 *      requires a recorded root cause.
 *   3. The audit log is append-only. There is no API to edit or remove an
 *      entry — the type system here offers none, mirroring the immutability
 *      the shipped app enforces at its storage boundary.
 */

export type KpiDefinition = {
  key: string;
  name: string;
  owner: string;
  unit: string;
  /** Where we want the number. */
  target: number;
  /** Crossing this raises an anomaly. */
  warnBelow: number;
  readings: number[];
};

export type KpiStatus = "on-target" | "watch" | "breach";

export function statusOf(kpi: KpiDefinition): KpiStatus {
  const latest = kpi.readings[kpi.readings.length - 1];
  if (latest >= kpi.target) return "on-target";
  if (latest >= kpi.warnBelow) return "watch";
  return "breach";
}

export type AnomalyStatus = "open" | "investigating" | "resolved";

export type Anomaly = {
  id: number;
  kpiKey: string;
  detail: string;
  status: AnomalyStatus;
  rootCause: string | null;
};

export type AuditEntry = {
  at: number;
  actor: string;
  action: string;
};

export type OpsState = {
  kpis: KpiDefinition[];
  anomalies: Anomaly[];
  audit: ReadonlyArray<AuditEntry>;
  nextAnomalyId: number;
};

export class InvalidTransition extends Error {}

function append(state: OpsState, actor: string, action: string, at: number): ReadonlyArray<AuditEntry> {
  return [...state.audit, { at, actor, action }];
}

/** Detects breaches that do not yet have an open anomaly, and raises them. */
export function sweep(state: OpsState, at = 0): OpsState {
  let next = state;
  for (const kpi of state.kpis) {
    if (statusOf(kpi) !== "breach") continue;
    const already = next.anomalies.some(
      (anomaly) => anomaly.kpiKey === kpi.key && anomaly.status !== "resolved"
    );
    if (already) continue;
    const latest = kpi.readings[kpi.readings.length - 1];
    next = {
      ...next,
      anomalies: [
        ...next.anomalies,
        {
          id: next.nextAnomalyId,
          kpiKey: kpi.key,
          detail: `${kpi.name} at ${latest}${kpi.unit}, below the ${kpi.warnBelow}${kpi.unit} threshold (target ${kpi.target}${kpi.unit}).`,
          status: "open",
          rootCause: null,
        },
      ],
      audit: append(next, "system", `raised anomaly on ${kpi.name}`, at),
      nextAnomalyId: next.nextAnomalyId + 1,
    };
  }
  return next;
}

export function startInvestigation(state: OpsState, anomalyId: number, actor: string, at = 0): OpsState {
  const anomaly = state.anomalies.find((item) => item.id === anomalyId);
  if (!anomaly || anomaly.status !== "open") {
    throw new InvalidTransition("Only an open anomaly can move to investigating.");
  }
  return {
    ...state,
    anomalies: state.anomalies.map((item) =>
      item.id === anomalyId ? { ...item, status: "investigating" as const } : item
    ),
    audit: append(state, actor, `started investigating anomaly #${anomalyId}`, at),
  };
}

export function resolve(state: OpsState, anomalyId: number, rootCause: string, actor: string, at = 0): OpsState {
  const anomaly = state.anomalies.find((item) => item.id === anomalyId);
  if (!anomaly || anomaly.status !== "investigating") {
    throw new InvalidTransition("Only an anomaly under investigation can be resolved.");
  }
  if (rootCause.trim().length < 10) {
    throw new InvalidTransition("Resolution requires a recorded root cause.");
  }
  return {
    ...state,
    anomalies: state.anomalies.map((item) =>
      item.id === anomalyId ? { ...item, status: "resolved" as const, rootCause: rootCause.trim() } : item
    ),
    audit: append(state, actor, `resolved anomaly #${anomalyId}: ${rootCause.trim()}`, at),
  };
}

/** Pushes a new reading onto one KPI — the demo's "next week arrives" control. */
export function recordReading(state: OpsState, kpiKey: string, value: number, at = 0): OpsState {
  return {
    ...state,
    kpis: state.kpis.map((kpi) =>
      kpi.key === kpiKey ? { ...kpi, readings: [...kpi.readings, value] } : kpi
    ),
    audit: append(state, "system", `recorded ${value} on ${kpiKey}`, at),
  };
}

export const seedOps: OpsState = {
  kpis: [
    {
      key: "attendance",
      name: "Session attendance",
      owner: "Delivery lead",
      unit: "%",
      target: 85,
      warnBelow: 75,
      readings: [88, 86, 84, 79, 72],
    },
    {
      key: "data-freshness",
      name: "Data freshness",
      owner: "Ops analyst",
      unit: "%",
      target: 95,
      warnBelow: 90,
      readings: [97, 96, 96, 95, 96],
    },
    {
      key: "instructor-rating",
      name: "Instructor rating",
      owner: "Quality lead",
      unit: "%",
      target: 90,
      warnBelow: 80,
      readings: [91, 90, 88, 86, 83],
    },
  ],
  anomalies: [],
  audit: [],
  nextAnomalyId: 1,
};
