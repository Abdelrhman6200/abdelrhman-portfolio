/*
 * Session Link Automation — the naming convention and the batch run,
 * re-implemented for the demo.
 *
 * The original Power Automate workflow's leverage came from two things: an
 * identifier that encodes where a session belongs (so it can be filtered and
 * traced later), and a run that carries a session through creation, naming,
 * distribution and attendance binding without a human touching each step.
 * Both are reproduced here.
 */

export const GOVERNORATES = ["Cairo", "Giza", "Alexandria", "Mansoura", "Assiut"] as const;
export const VENDORS = ["Almentor", "iSkyTech", "EdVentures"] as const;
export const TRACKS = ["Web", "Data", "AI", "Design"] as const;

export type SessionRequest = {
  governorate: (typeof GOVERNORATES)[number];
  vendor: (typeof VENDORS)[number];
  track: (typeof TRACKS)[number];
  cohort: number;
  /** e.g. "THU 17:00" */
  slot: string;
};

/**
 * The convention: GOV-VEN-TRK-C##-DAYHHMM. Every part is recoverable by eye,
 * which is what made filtering inside the LMS possible.
 */
export function sessionCode(request: SessionRequest): string {
  const gov = request.governorate.slice(0, 3).toUpperCase();
  const ven = request.vendor.slice(0, 3).toUpperCase();
  const trk = request.track.slice(0, 3).toUpperCase();
  const cohort = `C${String(request.cohort).padStart(2, "0")}`;
  const slot = request.slot.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return [gov, ven, trk, cohort, slot].join("-");
}

/** Decodes a code back into its parts — the traceability the convention buys. */
export function decode(code: string): Record<string, string> | null {
  const parts = code.split("-");
  if (parts.length !== 5) return null;
  const [gov, ven, trk, cohort, slot] = parts;
  const governorate = GOVERNORATES.find((g) => g.slice(0, 3).toUpperCase() === gov);
  const vendor = VENDORS.find((v) => v.slice(0, 3).toUpperCase() === ven);
  const track = TRACKS.find((t) => t.slice(0, 3).toUpperCase() === trk);
  if (!governorate || !vendor || !track || !/^C\d{2}$/.test(cohort)) return null;
  return { governorate, vendor, track, cohort: cohort.slice(1), slot };
}

export const RUN_STAGES = ["Create meeting", "Apply naming", "Distribute link", "Bind attendance"] as const;

export type RunStage = (typeof RUN_STAGES)[number];

export type SessionRun = {
  code: string;
  /** Index into RUN_STAGES of the last completed step; -1 = queued. */
  completed: number;
};

export function advanceRun(run: SessionRun): SessionRun {
  return { ...run, completed: Math.min(run.completed + 1, RUN_STAGES.length - 1) };
}

export function isDone(run: SessionRun): boolean {
  return run.completed === RUN_STAGES.length - 1;
}

/** Advances the whole batch one tick: the first unfinished run steps forward. */
export function tickBatch(runs: SessionRun[]): SessionRun[] {
  const index = runs.findIndex((run) => !isDone(run));
  if (index < 0) return runs;
  return runs.map((run, i) => (i === index ? advanceRun(run) : run));
}
