import { db, platformConfig, githubAppConfig, decryptField } from "@trst/db";
import { createAppAuth } from "@octokit/auth-app";

export interface ResolvedConfig {
  anthropicApiKey: string;
  issueBackend: "linear" | "github" | "none";
  linearApiKey: string | null;
  linearTeamId: string | null;
}

export interface ResolvedGitHubConfig {
  installationToken: string;
}

export async function getConfig(): Promise<ResolvedConfig> {
  const [row] = await db.select().from(platformConfig).limit(1);

  if (!row?.anthropicApiKey) {
    throw new Error("Anthropic API key not configured — set it in the admin dashboard");
  }

  return {
    anthropicApiKey: decryptField(row.anthropicApiKey),
    issueBackend: row.issueBackend ?? "none",
    linearApiKey: row.linearApiKey ? decryptField(row.linearApiKey) : null,
    linearTeamId: row.linearTeamId,
  };
}

export async function getGitHubInstallationToken(): Promise<string> {
  const [row] = await db.select().from(githubAppConfig).limit(1);

  if (!row?.appId || !row?.privateKey || !row?.installationId) {
    throw new Error(
      "GitHub App not fully configured — set credentials and install the app in the admin dashboard"
    );
  }

  const auth = createAppAuth({
    appId: row.appId,
    privateKey: decryptField(row.privateKey),
    installationId: row.installationId,
  });

  const result = await auth({ type: "installation" });
  return result.token;
}
