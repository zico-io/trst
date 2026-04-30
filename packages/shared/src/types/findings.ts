export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus = "open" | "resolved" | "suppressed";
export type ControlStatusValue = "passing" | "partial" | "failing" | "not-applicable";

export interface Finding {
  id: string;
  auditRunId: string;
  severity: FindingSeverity;
  controlRef: string;
  frameworkId: string;
  title: string;
  detail: string;
  remediationGuide: string;
  hash: string;
  status: FindingStatus;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ControlStatus {
  frameworkId: string;
  controlId: string;
  status: ControlStatusValue;
  score: number; // 0-100
  lastAuditRunId: string;
  updatedAt: Date;
}
