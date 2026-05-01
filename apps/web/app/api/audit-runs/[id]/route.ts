import { db, auditRuns, findings, controlStatuses, eq } from "@trst/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [run] = await db.select().from(auditRuns).where(eq(auditRuns.id, id)).limit(1);
  if (!run) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [runFindings, runControlStatuses] = await Promise.all([
    db.select().from(findings).where(eq(findings.auditRunId, id)),
    db.select().from(controlStatuses).where(eq(controlStatuses.lastAuditRunId, id)),
  ]);

  return Response.json({ run, findings: runFindings, controlStatuses: runControlStatuses });
}
