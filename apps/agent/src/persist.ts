import type { MappedFinding } from "./types";
import type { AuditRunStatus } from "@trst/shared";

// Derive a stable hash for a finding so we can detect duplicates across runs
export function hashFinding(auditRunId: string, controlRef: string, title: string): string {
  const raw = `${auditRunId}:${controlRef}:${title}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  // djb2 hash — fast and deterministic for dedup within a run
  let hash = 5381;
  for (const byte of data) {
    hash = ((hash << 5) + hash) ^ byte;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function persistMappedFindings(
  auditRunId: string,
  mappedFindings: MappedFinding[]
): Promise<void> {
  if (mappedFindings.length === 0) return;

  const { db, findings, controlStatuses } = await import("@trst/db");
  const { sql } = await import("drizzle-orm");

  // Upsert findings — conflict on hash column (no controlId column in schema)
  await db
    .insert(findings)
    .values(
      mappedFindings.map((mf) => ({
        auditRunId,
        severity: mf.rawFinding.severity,
        controlRef: mf.controlRef,
        frameworkId: mf.frameworkId,
        title: mf.rawFinding.title,
        detail: mf.rawFinding.detail,
        remediationGuide: mf.remediationGuide,
        hash: hashFinding(auditRunId, mf.controlRef, mf.rawFinding.title),
        status: "open" as const,
      }))
    )
    .onConflictDoUpdate({
      target: findings.hash,
      set: {
        detail: sql`excluded.detail`,
        remediationGuide: sql`excluded.remediation_guide`,
        severity: sql`excluded.severity`,
      },
    });

  // Upsert control statuses — conflict on (frameworkId, controlId) composite PK
  const controlStatusValues = mappedFindings.map((mf) => ({
    frameworkId: mf.frameworkId,
    controlId: mf.controlId,
    status: mf.controlStatus,
    score: mf.controlStatus === "passing" ? 100 : mf.controlStatus === "partial" ? 50 : 0,
    lastAuditRunId: auditRunId,
    updatedAt: new Date(),
  }));

  // Deduplicate by frameworkId+controlId (keep worst status)
  const deduped = new Map<string, (typeof controlStatusValues)[0]>();
  for (const cs of controlStatusValues) {
    const key = `${cs.frameworkId}:${cs.controlId}`;
    const existing = deduped.get(key);
    if (!existing || cs.score < existing.score) {
      deduped.set(key, cs);
    }
  }

  if (deduped.size > 0) {
    await db
      .insert(controlStatuses)
      .values([...deduped.values()])
      .onConflictDoUpdate({
        target: [controlStatuses.frameworkId, controlStatuses.controlId],
        set: {
          status: sql`excluded.status`,
          score: sql`excluded.score`,
          lastAuditRunId: sql`excluded.last_audit_run_id`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }
}

export async function updateAuditRunStatus(
  auditRunId: string,
  status: AuditRunStatus,
  completedAt?: Date
): Promise<void> {
  const { db, auditRuns } = await import("@trst/db");
  const { eq } = await import("drizzle-orm");

  await db
    .update(auditRuns)
    .set({
      status,
      ...(completedAt ? { completedAt } : {}),
    })
    .where(eq(auditRuns.id, auditRunId));
}

export async function createAuditRun(repoId: string): Promise<string> {
  const { db, auditRuns } = await import("@trst/db");

  const [row] = await db
    .insert(auditRuns)
    .values({ repoId, status: "pending" })
    .returning({ id: auditRuns.id });

  if (!row) throw new Error("createAuditRun: insert returned no row");
  return row.id;
}
