import { db, auditRuns, findings, controlStatuses } from "@trst/db";
import { eq, and, inArray } from "drizzle-orm";
import { runAllAuditors } from "./auditors/index";
import { runGapMapper } from "./gap-mapper";
import { createIssueBackend } from "./issue-backends/index";
import {
  createAuditRun,
  persistMappedFindings,
  updateAuditRunStatus,
} from "./persist";
import { revalidateTrustCenter } from "./revalidate";

const AGENT_API_KEY = process.env.AGENT_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

function requireBearerAuth(request: Request): Response | null {
  if (!AGENT_API_KEY) return null; // auth disabled if not configured
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${AGENT_API_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function notFound(): Response {
  return json({ error: "Not found" }, 404);
}

// ─── POST /audits/run ────────────────────────────────────────────────────────

async function handleRunAudit(request: Request): Promise<Response> {
  const authError = requireBearerAuth(request);
  if (authError) return authError;

  let body: { repoId?: string; repoFullName?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { repoId, repoFullName } = body;
  if (!repoId || !repoFullName) {
    return json({ error: "repoId and repoFullName are required" }, 400);
  }

  // Create the AuditRun record immediately so caller can poll
  const auditRunId = await createAuditRun(repoId);

  // Fire-and-forget the audit pipeline — respond 202 immediately
  runAuditPipeline({ auditRunId, repoId, repoFullName }).catch((err) => {
    console.error(`[audit] Pipeline failed for run ${auditRunId}:`, err);
    updateAuditRunStatus(auditRunId, "failed").catch(console.error);
  });

  return json({ auditRunId, status: "pending" }, 202);
}

async function runAuditPipeline({
  auditRunId,
  repoId,
  repoFullName,
}: {
  auditRunId: string;
  repoId: string;
  repoFullName: string;
}): Promise<void> {
  await updateAuditRunStatus(auditRunId, "running");

  // Step 1: Run all 3 auditors in parallel
  const auditorResults = await runAllAuditors({
    repoFullName,
    githubToken: GITHUB_TOKEN,
    anthropicApiKey: ANTHROPIC_API_KEY,
  });

  const rawFindings = auditorResults.flatMap((r) => r.findings);
  console.log(`[audit] ${auditRunId}: ${rawFindings.length} raw findings from auditors`);

  // Step 2: GapMapper — map raw findings to framework control refs
  const mappedFindings = await runGapMapper({
    rawFindings,
    anthropicApiKey: ANTHROPIC_API_KEY,
  });
  console.log(`[audit] ${auditRunId}: ${mappedFindings.length} mapped findings from GapMapper`);

  // Step 3: Persist — upsert findings + update control_statuses
  await persistMappedFindings(auditRunId, mappedFindings);
  await updateAuditRunStatus(auditRunId, "complete", new Date());
  console.log(`[audit] ${auditRunId}: persisted — status=complete`);

  // Step 4: Fan out — issue creation + ISR revalidation (parallel, best-effort)
  const issueBackend = createIssueBackend();

  await Promise.allSettled([
    ...mappedFindings.map((mf) =>
      issueBackend.createIssue(mf.rawFinding).catch((err) => {
        console.error(`[audit] ${auditRunId}: createIssue failed for "${mf.rawFinding.title}":`, err);
      })
    ),
    revalidateTrustCenter(repoId).catch((err) => {
      console.error(`[audit] ${auditRunId}: revalidation failed:`, err);
    }),
  ]);
}

// ─── GET /audits/:id ────────────────────────────────────────────────────────

async function handleGetAudit(id: string): Promise<Response> {
  const [row] = await db
    .select()
    .from(auditRuns)
    .where(eq(auditRuns.id, id))
    .limit(1);

  if (!row) return json({ error: "AuditRun not found" }, 404);
  return json(row);
}

// ─── GET /findings ──────────────────────────────────────────────────────────

async function handleGetFindings(url: URL): Promise<Response> {
  const repoId = url.searchParams.get("repoId");
  const frameworkId = url.searchParams.get("frameworkId");
  const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "50")));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (frameworkId) {
    conditions.push(eq(findings.frameworkId, frameworkId));
  }

  if (status) {
    conditions.push(
      eq(findings.status, status as "open" | "resolved" | "suppressed")
    );
  }

  if (repoId) {
    const runRows = await db
      .select({ id: auditRuns.id })
      .from(auditRuns)
      .where(eq(auditRuns.repoId, repoId));
    const ids = runRows.map((r) => r.id);
    if (ids.length > 0) {
      conditions.push(inArray(findings.auditRunId, ids));
    } else {
      // No runs for this repo — return empty
      return json({ data: [], page, limit });
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(findings)
    .where(whereClause)
    .orderBy(findings.createdAt)
    .limit(limit)
    .offset(offset);

  return json({ data: rows, page, limit });
}

// ─── GET /control-statuses ──────────────────────────────────────────────────

async function handleGetControlStatuses(url: URL): Promise<Response> {
  const frameworkId = url.searchParams.get("frameworkId");

  const rows = await db
    .select()
    .from(controlStatuses)
    .where(frameworkId ? eq(controlStatuses.frameworkId, frameworkId) : undefined)
    .orderBy(controlStatuses.frameworkId, controlStatuses.controlId);

  return json({ data: rows });
}

// ─── Main router ────────────────────────────────────────────────────────────

export async function router(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { method, pathname } = { method: request.method, pathname: url.pathname };

  if (method === "GET" && pathname === "/health") {
    return json({ ok: true, service: "agent", ts: new Date().toISOString() });
  }

  if (method === "POST" && pathname === "/audits/run") {
    return handleRunAudit(request);
  }

  const auditMatch = pathname.match(/^\/audits\/([^/]+)$/);
  if (method === "GET" && auditMatch) {
    return handleGetAudit(auditMatch[1]);
  }

  if (method === "GET" && pathname === "/findings") {
    return handleGetFindings(url);
  }

  if (method === "GET" && pathname === "/control-statuses") {
    return handleGetControlStatuses(url);
  }

  return notFound();
}
