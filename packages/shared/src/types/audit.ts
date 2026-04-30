export type AuditRunStatus = "pending" | "running" | "complete" | "failed";

export interface AuditRun {
  id: string;
  repoId: string;
  status: AuditRunStatus;
  startedAt: Date;
  completedAt?: Date;
}
