import { LinearClient } from "@linear/sdk";
import type { IssueBackend } from "./index";
import type { RawFinding } from "../types";

const SEVERITY_PRIORITY: Record<string, number> = {
  critical: 1, // Urgent
  high: 2,     // High
  medium: 3,   // Medium
  low: 4,      // Low
  info: 4,     // Low
};

export function formatLinearTitle(finding: RawFinding): string {
  return `[${finding.severity.toUpperCase()}] ${finding.title}`;
}

export function formatLinearDescription(finding: RawFinding): string {
  return `## Compliance Finding\n\n**Severity:** ${finding.severity}\n**Category:** ${finding.category}\n\n### Detail\n\n${finding.detail}`;
}

export class LinearBackend implements IssueBackend {
  private client: LinearClient;
  private teamId: string;

  constructor({ apiKey, teamId }: { apiKey: string; teamId: string }) {
    this.client = new LinearClient({ apiKey });
    this.teamId = teamId;
  }

  async createIssue(finding: RawFinding): Promise<string> {
    const payload = await this.client.createIssue({
      teamId: this.teamId,
      title: formatLinearTitle(finding),
      description: formatLinearDescription(finding),
      priority: SEVERITY_PRIORITY[finding.severity] ?? 3,
    });

    if (!payload.success || !payload.issue) {
      throw new Error(`LinearBackend: createIssue failed for "${finding.title}"`);
    }

    const issue = await payload.issue;
    return issue.url;
  }

  async closeIssue(issueUrl: string): Promise<void> {
    const issueId = issueUrl.split("/").pop();
    if (!issueId) throw new Error(`LinearBackend: cannot parse issue ID from URL ${issueUrl}`);

    const team = await this.client.team(this.teamId);
    const statesConnection = await team.states();
    const doneState = statesConnection.nodes.find(
      (s) => s.type === "completed" || s.name.toLowerCase() === "done"
    );

    if (!doneState) {
      throw new Error("LinearBackend: cannot find a completed state for the team");
    }

    await this.client.updateIssue(issueId, { stateId: doneState.id });
  }

  async updateIssue(issueUrl: string, finding: RawFinding): Promise<void> {
    const issueId = issueUrl.split("/").pop();
    if (!issueId) throw new Error(`LinearBackend: cannot parse issue ID from URL ${issueUrl}`);

    await this.client.updateIssue(issueId, {
      title: formatLinearTitle(finding),
      description: formatLinearDescription(finding),
      priority: SEVERITY_PRIORITY[finding.severity] ?? 3,
    });
  }
}
