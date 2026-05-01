import { withServerSpan } from "@trst/telemetry";
import { db, auditRuns, findings, controlStatuses } from "@trst/db";
import { eq, and, inArray } from "drizzle-orm";
import { runGapMapper } from "./gap-mapper";
import { createIssueBackend } from "./issue-backends/index";
import {
  createAuditRun,
  initRunMetadata,
  updateRunStep,
  persistMappedFindings,
  updateAuditRunStatus,
} from "./persist";
import { runCodeAuditor } from "./auditors/code-auditor";
import { runPolicyAuditor } from "./auditors/policy-auditor";
import { runProcessAuditor } from "./auditors/process-auditor";
import { revalidateTrustCenter } from "./revalidate";
import { getConfig, getGitHubInstallationToken } from "./config";

const AGENT_API_KEY = process.env.AGENT_API_KEY;

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

  let config: Awaited<ReturnType<typeof getConfig>>;
  let githubToken: string;
  try {
    [config, githubToken] = await Promise.all([getConfig(), getGitHubInstallationToken()]);
  } catch (err) {
    return json({ error: (err as Error).message }, 503);
  }

  const auditRunId = await createAuditRun(repoId);

  runAuditPipeline({ auditRunId, repoId, repoFullName, config, githubToken }).catch((err) => {
    console.error(`[audit] Pipeline failed for run ${auditRunId}:`, err);
    updateAuditRunStatus(auditRunId, "failed").catch(console.error);
  });

  return json({ auditRunId, status: "pending" }, 202);
}

async function runAuditPipeline({
  auditRunId,
  repoId,
  repoFullName,
  config,
  githubToken,
}: {
  auditRunId: string;
  repoId: string;
  repoFullName: string;
  config: Awaited<ReturnType<typeof getConfig>>;
  githubToken: string;
}): Promise<void> {
  const ts = () => new Date().toISOString();

  await initRunMetadata(auditRunId);
  await updateAuditRunStatus(auditRunId, "running");

  // Run the three auditors in parallel, each tracking its own step
  const codePromise = (async () => {
    await updateRunStep(auditRunId, "code_audit", { status: "running", startedAt: ts() });
    const r = await runCodeAuditor(repoFullName, githubToken, config.anthropicApiKey);
    await updateRunStep(auditRunId, "code_audit", { status: "complete", completedAt: ts() });
    return r;
  })();

  const policyPromise = (async () => {
    await updateRunStep(auditRunId, "policy_audit", { status: "running", startedAt: ts() });
    const r = await runPolicyAuditor(config.anthropicApiKey);
    await updateRunStep(auditRunId, "policy_audit", { status: "complete", completedAt: ts() });
    return r;
  })();

  const processPromise = (async () => {
    await updateRunStep(auditRunId, "process_audit", { status: "running", startedAt: ts() });
    const r = await runProcessAuditor(repoFullName, githubToken);
    await updateRunStep(auditRunId, "process_audit", { status: "complete", completedAt: ts() });
    return r;
  })();

  const [codeResult, policyResult, processResult] = await Promise.all([
    codePromise, policyPromise, processPromise,
  ]);

  const rawFindings = [codeResult, policyResult, processResult].flatMap((r) => r.findings);
  console.log(`[audit] ${auditRunId}: ${rawFindings.length} raw findings from auditors`);

  await updateRunStep(auditRunId, "gap_mapping", { status: "running", startedAt: ts() });
  const mappedFindings = await runGapMapper({
    rawFindings,
    anthropicApiKey: config.anthropicApiKey,
  });
  await updateRunStep(auditRunId, "gap_mapping", { status: "complete", completedAt: ts() });
  console.log(`[audit] ${auditRunId}: ${mappedFindings.length} mapped findings from GapMapper`);

  await updateRunStep(auditRunId, "persist", { status: "running", startedAt: ts() });
  await persistMappedFindings(auditRunId, repoId, mappedFindings);
  await updateRunStep(auditRunId, "persist", { status: "complete", completedAt: ts() });
  await updateAuditRunStatus(auditRunId, "complete", new Date());
  console.log(`[audit] ${auditRunId}: persisted — status=complete`);

  const issueBackend = await createIssueBackend(config, githubToken);

  await updateRunStep(auditRunId, "issue_sync", { status: "running", startedAt: ts() });
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
  await updateRunStep(auditRunId, "issue_sync", { status: "complete", completedAt: ts() });
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

async function dispatch(
  url: URL,
  method: string,
  pathname: string,
  request: Request
): Promise<Response> {
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

export async function router(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  return withServerSpan(method, pathname, request.headers, () =>
    dispatch(url, method, pathname, request)
  );
}
