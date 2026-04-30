import Anthropic from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";
import type { RawFinding, AuditorResult } from "../types";

const SAMPLE_FILE_LIMIT = 20;
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
  ".ttf", ".eot", ".pdf", ".zip", ".tar", ".gz", ".lock",
]);

function isSampleable(path: string): boolean {
  const ext = path.slice(path.lastIndexOf("."));
  return !BINARY_EXTENSIONS.has(ext);
}

export async function runCodeAuditor(
  repoFullName: string,
  githubToken: string,
  anthropicApiKey: string
): Promise<AuditorResult> {
  const [owner, repo] = repoFullName.split("/");
  const octokit = new Octokit({ auth: githubToken });
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  // Fetch the full repo file tree (recursive)
  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: "HEAD",
    recursive: "1",
  });

  const leafFiles = treeData.tree
    .filter((item) => item.type === "blob" && item.path && isSampleable(item.path))
    .slice(0, SAMPLE_FILE_LIMIT);

  // Fetch file contents in parallel (cap at 50 KB per file)
  const fileContents = await Promise.all(
    leafFiles.map(async (item) => {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: item.path!,
        });
        if (!Array.isArray(data) && data.type === "file" && data.content) {
          const decoded = Buffer.from(data.content, "base64").toString("utf-8").slice(0, 50_000);
          return `// FILE: ${item.path}\n${decoded}`;
        }
        return null;
      } catch {
        return null;
      }
    })
  );

  const fileTreeText = treeData.tree
    .filter((item) => item.path)
    .map((item) => `${item.type === "tree" ? "DIR" : "FILE"} ${item.path}`)
    .join("\n");

  const sampledContent = fileContents.filter(Boolean).join("\n\n---\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a compliance security auditor. Analyze the following GitHub repository file tree and sample file contents for compliance risks relevant to SOC 2, HIPAA, GDPR, ISO 27001, and HITRUST.

## Repository File Tree
\`\`\`
${fileTreeText}
\`\`\`

## Sample File Contents
${sampledContent}

Return a JSON array of findings. Each finding must have:
- severity: "critical" | "high" | "medium" | "low" | "info"
- title: short one-line description
- detail: 2-4 sentences explaining the risk and where it was found

Return ONLY valid JSON — no markdown, no explanation. Example:
[{"severity":"high","title":"Hardcoded secret in config","detail":"The file config/db.ts contains a hardcoded PostgreSQL password. This exposes credentials in source control and violates least-privilege principles."}]`,
      },
    ],
  });

  let findings: RawFinding[] = [];
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const parsed = JSON.parse(text) as Array<{ severity: string; title: string; detail: string }>;
    findings = parsed.map((f) => ({
      severity: f.severity as RawFinding["severity"],
      category: "code" as const,
      title: f.title,
      detail: f.detail,
    }));
  } catch {
    // Claude returned non-JSON — treat as empty findings for this run
    findings = [];
  }

  return { auditor: "code", findings };
}
