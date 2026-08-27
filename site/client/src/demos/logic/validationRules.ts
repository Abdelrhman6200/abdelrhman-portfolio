/*
 * Smart Excel Validation — the rule engine, re-implemented for the demo.
 *
 * The original system ran custom Excel functions and conditional logic over
 * 40,000+ student records, surfacing exceptions for staff review rather than
 * silently correcting them. This module runs the same class of rules over an
 * editable table in the browser: required fields, format checks, cross-row
 * duplicates, and cross-field conflicts.
 */

export type StudentRow = {
  id: string;
  name: string;
  phone: string;
  track: string;
  /** e.g. "THU 17:00" */
  slot: string;
};

export type Severity = "error" | "warning";

export type Finding = {
  rowIndex: number;
  field: keyof StudentRow;
  rule: string;
  severity: Severity;
  message: string;
};

export const TRACKS = ["Web Development", "Data Analysis", "AI Fundamentals", "Digital Design"];

/** One rule per real-world failure the original system caught. */
export function validate(rows: StudentRow[]): Finding[] {
  const findings: Finding[] = [];
  const flag = (rowIndex: number, field: keyof StudentRow, rule: string, severity: Severity, message: string) =>
    findings.push({ rowIndex, field, rule, severity, message });

  // Cross-row indexes, built once.
  const idCounts = new Map<string, number>();
  const phoneCounts = new Map<string, number>();
  for (const row of rows) {
    const id = row.id.trim().toUpperCase();
    if (id) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    const phone = row.phone.replace(/\D/g, "");
    if (phone) phoneCounts.set(phone, (phoneCounts.get(phone) ?? 0) + 1);
  }

  rows.forEach((row, index) => {
    // Required fields.
    (["id", "name", "track", "slot"] as const).forEach((field) => {
      if (!row[field].trim()) flag(index, field, "required", "error", "Required field is empty.");
    });

    // Student ID format: ST- followed by four digits.
    const id = row.id.trim().toUpperCase();
    if (id && !/^ST-\d{4}$/.test(id)) {
      flag(index, "id", "id-format", "error", "Expected the form ST-0000.");
    }

    // Duplicate ID anywhere in the sheet.
    if (id && (idCounts.get(id) ?? 0) > 1) {
      flag(index, "id", "duplicate-id", "error", "This ID appears more than once.");
    }

    // Phone: optional, but if present must contain 10-13 digits.
    const digits = row.phone.replace(/\D/g, "");
    if (row.phone.trim() && (digits.length < 10 || digits.length > 13)) {
      flag(index, "phone", "phone-format", "error", "Expected 10–13 digits.");
    }
    if (digits && (phoneCounts.get(digits) ?? 0) > 1) {
      flag(index, "phone", "duplicate-phone", "warning", "Another record shares this phone number.");
    }

    // Track must be one of the known programmes.
    if (row.track.trim() && !TRACKS.includes(row.track.trim())) {
      flag(index, "track", "unknown-track", "error", `Unknown track. Expected one of: ${TRACKS.join(", ")}.`);
    }

    // Slot format: three-letter day + 24h time.
    if (row.slot.trim() && !/^(SAT|SUN|MON|TUE|WED|THU|FRI)\s+([01]\d|2[0-3]):[0-5]\d$/i.test(row.slot.trim())) {
      flag(index, "slot", "slot-format", "error", "Expected e.g. THU 17:00.");
    }
  });

  // Cross-field conflict: one student cannot hold two different slots.
  const byId = new Map<string, Array<{ index: number; slot: string }>>();
  rows.forEach((row, index) => {
    const id = row.id.trim().toUpperCase();
    if (!id) return;
    const list = byId.get(id) ?? [];
    list.push({ index, slot: row.slot.trim().toUpperCase() });
    byId.set(id, list);
  });
  for (const entries of Array.from(byId.values())) {
    const slots = new Set(entries.map((entry) => entry.slot).filter(Boolean));
    if (entries.length > 1 && slots.size > 1) {
      for (const entry of entries) {
        flag(entry.index, "slot", "slot-conflict", "warning", "Same student holds two different slots.");
      }
    }
  }

  return findings;
}

export type SheetSummary = {
  total: number;
  clean: number;
  errorRows: number;
  warningRows: number;
};

export function summarize(rows: StudentRow[], findings: Finding[]): SheetSummary {
  const errorRows = new Set(findings.filter((f) => f.severity === "error").map((f) => f.rowIndex));
  const warningRows = new Set(
    findings.filter((f) => f.severity === "warning" && !errorRows.has(f.rowIndex)).map((f) => f.rowIndex)
  );
  return {
    total: rows.length,
    clean: rows.length - errorRows.size - warningRows.size,
    errorRows: errorRows.size,
    warningRows: warningRows.size,
  };
}

/** Seed data containing one of each failure mode, so the demo opens with work to do. */
export const seedRows: StudentRow[] = [
  { id: "ST-1042", name: "Mariam Hassan", phone: "01012345678", track: "Web Development", slot: "THU 17:00" },
  { id: "ST-1043", name: "Omar Khaled", phone: "0101234", track: "Data Analysis", slot: "SAT 15:00" },
  { id: "ST-1042", name: "Mariam H.", phone: "01012345678", track: "Web Development", slot: "SUN 19:00" },
  { id: "1044", name: "Nour Adel", phone: "01098765432", track: "AI Fundamentals", slot: "TUE 18:00" },
  { id: "ST-1045", name: "", phone: "01155512345", track: "Robotics", slot: "17:00 THU" },
  { id: "ST-1046", name: "Youssef Samir", phone: "", track: "Digital Design", slot: "WED 16:00" },
];

/** A second batch to import mid-demo — fresh failure modes, one clean row. */
export const messyBatch: StudentRow[] = [
  { id: "ST-1047", name: "Laila Fathy", phone: "01234567890", track: "Data Analysis", slot: "SAT 13:00" },
  { id: "ST-1046", name: "Yousef S.", phone: "0122334455667788", track: "Digital Design", slot: "WED 16:00" },
  { id: "ST-1048", name: "Hana Adel", phone: "01099887766", track: "Cybersecurity", slot: "FRIDAY 5PM" },
  { id: "", name: "Walk-in (no form)", phone: "", track: "Web Development", slot: "MON 18:00" },
];
