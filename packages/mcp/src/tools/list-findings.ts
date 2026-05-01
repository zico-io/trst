import { z } from "zod";
import { db, findings, auditRuns, eq, and, inArray, sql } from "@trst/db";

export const listFindingsSchema = z.object({
  status: z.enum(["open", "in-progress", "resolved", "suppressed"]).optional().default("open"),
  severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
  frameworkId: z.enum(["hipaa", "soc2", "gdpr", "iso27001", "hitrust"]).optional(),
  repoId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const SEVERITY_ORDER = sql`CASE severity
  WHEN 'critical' THEN 0
  WHEN 'high' THEN 1
  WHEN 'medium' THEN 2
  WHEN 'low' THEN 3
  WHEN 'info' THEN 4
  ELSE 5
END`;

export async function listFindings(input: z.infer<typeof listFindingsSchema>) {
  const conditions = [];

  conditions.push(eq(findings.status, input.status));

  if (input.severity) {
    conditions.push(eq(findings.severity, input.severity));
  }

  if (input.frameworkId) {
    conditions.push(eq(findings.frameworkId, input.frameworkId));
  }

  if (input.repoId) {
    const runs = await db
      .select({ id: auditRuns.id })
      .from(auditRuns)
      .where(eq(auditRuns.repoId, input.repoId));
    const ids = runs.map((r) => r.id);
    if (ids.length === 0) return [];
    conditions.push(inArray(findings.auditRunId, ids));
  }

  const rows = await db
    .select({
      id: findings.id,
      title: findings.title,
      severity: findings.severity,
      controlRef: findings.controlRef,
      frameworkId: findings.frameworkId,
      status: findings.status,
      claimedBy: findings.claimedBy,
      detail: findings.detail,
      createdAt: findings.createdAt,
    })
    .from(findings)
    .where(and(...conditions))
    .orderBy(SEVERITY_ORDER, findings.createdAt)
    .limit(input.limit);

  return rows.map((r) => ({
    ...r,
    detail: r.detail.length > 300 ? `${r.detail.slice(0, 300)}…` : r.detail,
  }));
}
