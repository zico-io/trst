"use server";

import { db, platformConfig, githubAppConfig, githubRepos, eq, encryptField } from "@trst/db";
import { revalidatePath } from "next/cache";

// ── Platform config ──────────────────────────────────────────────────────────

export async function savePlatformConfig(data: {
  anthropicApiKey?: string;
  issueBackend?: "linear" | "github" | "none";
  linearApiKey?: string;
  linearTeamId?: string;
}) {
  if (data.anthropicApiKey) data.anthropicApiKey = encryptField(data.anthropicApiKey);
  if (data.linearApiKey) data.linearApiKey = encryptField(data.linearApiKey);
  await db
    .insert(platformConfig)
    .values({ id: "singleton", ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: platformConfig.id,
      set: { ...data, updatedAt: new Date() },
    });
  revalidatePath("/admin/llm");
  revalidatePath("/admin/issue-backend");
}

// ── GitHub App config ────────────────────────────────────────────────────────

export async function saveGitHubAppConfig(data: {
  appId?: string;
  appName?: string;
  privateKey?: string;
  webhookSecret?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  if (data.privateKey) data.privateKey = encryptField(data.privateKey);
  if (data.webhookSecret) data.webhookSecret = encryptField(data.webhookSecret);
  if (data.clientSecret) data.clientSecret = encryptField(data.clientSecret);
  await db
    .insert(githubAppConfig)
    .values({ id: "singleton", ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: githubAppConfig.id,
      set: { ...data, updatedAt: new Date() },
    });
  revalidatePath("/admin/github");
}

// ── Repos ────────────────────────────────────────────────────────────────────

export async function addRepo(fullName: string) {
  await db
    .insert(githubRepos)
    .values({ fullName })
    .onConflictDoNothing({ target: githubRepos.fullName });
  revalidatePath("/admin/repos");
}

export async function toggleRepo(id: string, enabled: boolean) {
  await db.update(githubRepos).set({ enabled }).where(eq(githubRepos.id, id));
  revalidatePath("/admin/repos");
}

export async function removeRepo(id: string) {
  await db.delete(githubRepos).where(eq(githubRepos.id, id));
  revalidatePath("/admin/repos");
}

export async function triggerAudit(repoId: string, repoFullName: string) {
  const agentUrl = process.env.AGENT_URL;
  const agentApiKey = process.env.AGENT_API_KEY;

  if (!agentUrl) throw new Error("AGENT_URL is not configured");

  const res = await fetch(`${agentUrl}/audits/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(agentApiKey ? { Authorization: `Bearer ${agentApiKey}` } : {}),
    },
    body: JSON.stringify({ repoId, repoFullName }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Agent returned ${res.status}: ${body}`);
  }

  return res.json() as Promise<{ auditRunId: string; status: string }>;
}
