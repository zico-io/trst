import type { RawFinding } from "../types";
import { LinearBackend } from "./linear";
import { GitHubBackend } from "./github";

export interface IssueBackend {
  createIssue(finding: RawFinding): Promise<string>; // returns issue URL
  closeIssue(issueUrl: string): Promise<void>;
  updateIssue(issueUrl: string, finding: RawFinding): Promise<void>;
}

export function createIssueBackend(): IssueBackend {
  const backend = process.env.ISSUE_BACKEND ?? "linear";

  if (backend === "github") {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    if (!owner || !repo || !token) {
      throw new Error("GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN are required for ISSUE_BACKEND=github");
    }
    return new GitHubBackend({ owner, repo, token });
  }

  // Default: linear
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!apiKey || !teamId) {
    throw new Error("LINEAR_API_KEY and LINEAR_TEAM_ID are required for ISSUE_BACKEND=linear");
  }
  return new LinearBackend({ apiKey, teamId });
}
