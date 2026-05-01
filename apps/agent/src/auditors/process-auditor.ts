import { Octokit } from "@octokit/rest";
import type { RawFinding, AuditorResult } from "../types";

export async function runProcessAuditor(
  repoFullName: string,
  githubToken: string
): Promise<AuditorResult> {
  const [owner, repo] = repoFullName.split("/");
  const octokit = new Octokit({ auth: githubToken });
  const findings: RawFinding[] = [];

  // --- Branch protection check ---
  let defaultBranch = "main";
  try {
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    defaultBranch = repoData.default_branch;
  } catch {
    // fallback to main
  }

  let branchProtection: Awaited<ReturnType<typeof octokit.repos.getBranchProtection>>["data"] | null = null;
  try {
    const { data } = await octokit.repos.getBranchProtection({
      owner,
      repo,
      branch: defaultBranch,
    });
    branchProtection = data;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 403) {
      findings.push({
        severity: "low",
        category: "process",
        title: `Branch protection status unknown — insufficient token permissions`,
        detail: `The GitHub token does not have admin access to read branch protection rules on "${defaultBranch}". Grant the installation read access to Administration to enable this check.`,
      });
    } else {
      findings.push({
        severity: "critical",
        category: "process",
        title: `No branch protection on ${defaultBranch}`,
        detail: `The default branch "${defaultBranch}" has no branch protection rules configured. Direct pushes and force-pushes are permitted, which violates SOC 2 change management controls and HIPAA access control requirements.`,
      });
    }
  }

  if (branchProtection) {
    // Required PR reviews
    const requiredReviewers =
      branchProtection.required_pull_request_reviews?.required_approving_review_count ?? 0;
    if (requiredReviewers < 1) {
      findings.push({
        severity: "high",
        category: "process",
        title: "Pull requests do not require approvals",
        detail: `Branch protection on "${defaultBranch}" does not require at least one approving review before merge. Peer review is a key change management control under SOC 2 CC8.1 and ISO 27001 A.12.1.2.`,
      });
    }

    // Dismiss stale reviews
    if (!branchProtection.required_pull_request_reviews?.dismiss_stale_reviews) {
      findings.push({
        severity: "medium",
        category: "process",
        title: "Stale pull request approvals are not dismissed on new commits",
        detail: `Branch protection on "${defaultBranch}" does not dismiss stale approvals when new commits are pushed. This allows an attacker to push malicious changes after approval without re-review.`,
      });
    }

    // Require status checks
    if (!branchProtection.required_status_checks) {
      findings.push({
        severity: "high",
        category: "process",
        title: "No required CI status checks before merge",
        detail: `Branch protection on "${defaultBranch}" does not enforce required status checks. Code can be merged without passing automated tests or security scans, violating continuous integration best practices.`,
      });
    }
  }

  // --- GitHub Actions workflow checks ---
  let workflows: { name: string; path: string }[] = [];
  try {
    const { data } = await octokit.actions.listRepoWorkflows({ owner, repo });
    workflows = data.workflows.map((w) => ({ name: w.name, path: w.path }));
  } catch {
    // Actions may be disabled or repo is private without access
  }

  if (workflows.length === 0) {
    findings.push({
      severity: "medium",
      category: "process",
      title: "No GitHub Actions workflows detected",
      detail: "No CI/CD workflows are configured in this repository. Automated testing and security scanning are key controls under SOC 2 CC8.1 and HIPAA § 164.306(a)(1).",
    });
  }

  const hasSecretScan = workflows.some(
    (w) =>
      w.name.toLowerCase().includes("secret") ||
      w.name.toLowerCase().includes("security") ||
      w.name.toLowerCase().includes("scan")
  );
  if (!hasSecretScan) {
    findings.push({
      severity: "medium",
      category: "process",
      title: "No secret scanning or security scan workflow detected",
      detail: `No workflow name matches "secret", "security", or "scan". Automated secret detection is a SOC 2 availability and confidentiality control and is required under many HIPAA technical safeguard assessments.`,
    });
  }

  // --- Dependabot / dependency review ---
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path: ".github/dependabot.yml",
    });
  } catch {
    findings.push({
      severity: "low",
      category: "process",
      title: "Dependabot not configured",
      detail: "No .github/dependabot.yml was found. Automated dependency updates reduce the attack surface from known vulnerable packages, supporting SOC 2 CC6.8 and ISO 27001 A.12.6.1.",
    });
  }

  return { auditor: "process", findings };
}
