import type { RawFinding } from "../types";
import type { ResolvedConfig } from "../config";
import { LinearBackend } from "./linear";
import { GitHubBackend } from "./github";

export interface IssueBackend {
  createIssue(finding: RawFinding): Promise<string>; // returns issue URL
  closeIssue(issueUrl: string): Promise<void>;
  updateIssue(issueUrl: string, finding: RawFinding): Promise<void>;
}

const noopBackend: IssueBackend = {
  async createIssue() { return ""; },
  async closeIssue() {},
  async updateIssue() {},
};

export async function createIssueBackend(
  config: ResolvedConfig,
  githubToken: string
): Promise<IssueBackend> {
  if (config.issueBackend === "github") {
    // Parse owner/repo from the first enabled repo — or skip if not determinable
    // GitHub backend needs owner+repo; the token is the installation token
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!owner || !repo) {
      console.warn("[issue-backend] GITHUB_OWNER/GITHUB_REPO not set; skipping issue creation");
      return noopBackend;
    }
    return new GitHubBackend({ owner, repo, token: githubToken });
  }

  if (config.issueBackend === "linear") {
    const { linearApiKey, linearTeamId } = config;
    if (!linearApiKey || !linearTeamId) {
      throw new Error("LINEAR_API_KEY and LINEAR_TEAM_ID required for issue_backend=linear");
    }
    return new LinearBackend({ apiKey: linearApiKey, teamId: linearTeamId });
  }

  return noopBackend;
}
