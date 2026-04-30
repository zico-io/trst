import { Octokit } from "@octokit/rest";
import type { RawFinding } from "../types";

const SEVERITY_LABEL: Record<string, string> = {
  critical: "severity:critical",
  high: "severity:high",
  medium: "severity:medium",
  low: "severity:low",
  info: "severity:info",
};

export function formatGitHubTitle(finding: RawFinding): string {
  return `[${finding.severity.toUpperCase()}] ${finding.title}`;
}

export function formatGitHubBody(finding: RawFinding): string {
  return `## Compliance Finding\n\n**Severity:** ${finding.severity}\n**Category:** ${finding.category}\n\n### Detail\n\n${finding.detail}`;
}

export function parseIssueNumber(issueUrl: string): number {
  const match = issueUrl.match(/\/issues\/(\d+)$/);
  if (!match) throw new Error(`GitHubBackend: cannot parse issue number from URL ${issueUrl}`);
  return Number(match[1]);
}

export class GitHubBackend {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor({ owner, repo, token }: { owner: string; repo: string; token: string }) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  async createIssue(finding: RawFinding): Promise<string> {
    const label = SEVERITY_LABEL[finding.severity] ?? "severity:info";

    const { data } = await this.octokit.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: formatGitHubTitle(finding),
      body: formatGitHubBody(finding),
      labels: [label, `category:${finding.category}`, "compliance"],
    });

    return data.html_url;
  }

  async closeIssue(issueUrl: string): Promise<void> {
    const issueNumber = parseIssueNumber(issueUrl);

    await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state: "closed",
      state_reason: "completed",
    });
  }

  async updateIssue(issueUrl: string, finding: RawFinding): Promise<void> {
    const issueNumber = parseIssueNumber(issueUrl);
    const label = SEVERITY_LABEL[finding.severity] ?? "severity:info";

    await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      title: formatGitHubTitle(finding),
      body: formatGitHubBody(finding),
      labels: [label, `category:${finding.category}`, "compliance"],
    });
  }
}
