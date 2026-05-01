import { withDbSpan } from "@trst/telemetry";
import type { MappedFinding } from "./types";
import type { AuditRunStatus, StepName, StepStatus, RunStep, RunMetadata } from "@trst/shared";

// Derive a stable hash for a finding so we can detect duplicates across runs
export function hashFinding(repoId: string, frameworkId: string, controlRef: string, title: string): string {
  const raw = `${repoId}\0${frameworkId}\0${controlRef}\0${title}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  // djb2 hash — stable across runs for the same repo+framework+control+title
  let hash = 5381;
  for (const byte of data) {
    hash = ((hash << 5) + hash) ^ byte;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function persistMappedFindings(
  auditRunId: string,
  repoId: string,
  mappedFindings: MappedFinding[]
): Promise<void> {
  if (mappedFindings.length === 0) return;

  const { db, findings, controlStatuses } = await import("@trst/db");
  const { sql } = await import("drizzle-orm");

  // Upsert findings — conflict on hash column (no controlId column in schema)
  await withDbSpan("insert", "findings", () =>
    db
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
          hash: hashFinding(repoId, mf.frameworkId, mf.controlRef, mf.rawFinding.title),
          status: "open" as const,
        }))
      )
      .onConflictDoUpdate({
        target: findings.hash,
        set: {
          auditRunId: sql`excluded.audit_run_id`,
          detail: sql`excluded.detail`,
          remediationGuide: sql`excluded.remediation_guide`,
          severity: sql`excluded.severity`,
        },
      })
  );

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
    await withDbSpan("insert", "control_statuses", () =>
      db
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
        })
    );
  }
}

export async function updateAuditRunStatus(
  auditRunId: string,
  status: AuditRunStatus,
  completedAt?: Date
): Promise<void> {
  const { db, auditRuns } = await import("@trst/db");
  const { eq } = await import("drizzle-orm");

  await withDbSpan("update", "audit_runs", () =>
    db
      .update(auditRuns)
      .set({
        status,
        ...(completedAt ? { completedAt } : {}),
      })
      .where(eq(auditRuns.id, auditRunId))
  );
}

const STEP_NAMES: StepName[] = [
  "code_audit", "policy_audit", "process_audit",
  "gap_mapping", "persist", "issue_sync",
];

export async function initRunMetadata(auditRunId: string): Promise<void> {
  const { db, auditRuns } = await import("@trst/db");
  const { eq } = await import("drizzle-orm");
  const metadata: RunMetadata = {
    steps: STEP_NAMES.map((name) => ({ name, status: "pending" as StepStatus })),
  };
  await withDbSpan("update", "audit_runs", () =>
    db.update(auditRuns).set({ metadata }).where(eq(auditRuns.id, auditRunId))
  );
}

export async function updateRunStep(
  auditRunId: string,
  stepName: StepName,
  patch: { status: StepStatus; startedAt?: string; completedAt?: string }
): Promise<void> {
  const { db, auditRuns } = await import("@trst/db");
  const { eq } = await import("drizzle-orm");

  const [row] = await db.select({ metadata: auditRuns.metadata }).from(auditRuns).where(eq(auditRuns.id, auditRunId)).limit(1);
  if (!row) return;

  const meta = (row.metadata ?? { steps: [] }) as RunMetadata;
  meta.steps = meta.steps.map((s: RunStep) =>
    s.name === stepName ? { ...s, ...patch } : s
  );

  await withDbSpan("update", "audit_runs", () =>
    db.update(auditRuns).set({ metadata: meta }).where(eq(auditRuns.id, auditRunId))
  );
}

export async function createAuditRun(repoId: string): Promise<string> {
  const { db, auditRuns } = await import("@trst/db");

  const [row] = await withDbSpan("insert", "audit_runs", () =>
    db
      .insert(auditRuns)
      .values({ repoId, status: "pending" })
      .returning({ id: auditRuns.id })
  );

  if (!row) throw new Error("createAuditRun: insert returned no row");
  return row.id;
}
