export type AuditRunStatus = "pending" | "running" | "complete" | "failed";

export interface AuditRun {
  id: string;
  repoId: string;
  status: AuditRunStatus;
  startedAt: Date;
  completedAt?: Date;
}

export type StepName =
  | "code_audit"
  | "policy_audit"
  | "process_audit"
  | "gap_mapping"
  | "persist"
  | "issue_sync";

export type StepStatus = "pending" | "running" | "complete" | "failed";

export interface RunStep {
  name: StepName;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface RunMetadata {
  steps: RunStep[];
}
