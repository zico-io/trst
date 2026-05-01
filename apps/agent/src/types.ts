import type { ControlStatusValue, FindingSeverity, FrameworkId } from "@trst/shared";

// A finding before it's been mapped to a framework control
export interface RawFinding {
  severity: FindingSeverity;
  category: "code" | "process" | "policy";
  title: string;
  detail: string;
}

// Output of a single auditor
export interface AuditorResult {
  auditor: "code" | "process" | "policy";
  findings: RawFinding[];
}

// Output of GapMapper — one entry per raw finding
export interface MappedFinding {
  rawFinding: RawFinding;
  frameworkId: FrameworkId;
  controlRef: string;
  controlId: string;
  controlStatus: ControlStatusValue;
  remediationGuide: string;
}
