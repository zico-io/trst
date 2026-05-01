import { notFound } from "next/navigation";
import { db, auditRuns, findings, controlStatuses, eq } from "@trst/db";
import type { RunMetadata } from "@trst/shared";
import { AuditRunDetail } from "./client";

export default async function AuditRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [run] = await db.select().from(auditRuns).where(eq(auditRuns.id, id)).limit(1);
  if (!run) notFound();

  const [initialFindings, initialControlStatuses] = await Promise.all([
    db.select().from(findings).where(eq(findings.auditRunId, id)),
    db.select().from(controlStatuses).where(eq(controlStatuses.lastAuditRunId, id)),
  ]);

  return (
    <AuditRunDetail
      initialRun={{ ...run, metadata: run.metadata as RunMetadata | null }}
      initialFindings={initialFindings}
      initialControlStatuses={initialControlStatuses}
    />
  );
}
