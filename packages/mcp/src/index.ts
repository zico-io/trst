import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listFindings, listFindingsSchema } from "./tools/list-findings.js";
import { getFinding, getFindingSchema } from "./tools/get-finding.js";
import { claimFinding, claimFindingSchema } from "./tools/claim-finding.js";
import { resolveFinding, resolveFindingSchema } from "./tools/resolve-finding.js";
import { suppressFinding, suppressFindingSchema } from "./tools/suppress-finding.js";
import { releaseFinding, releaseFindingSchema } from "./tools/release-finding.js";

const server = new McpServer({ name: "trst-audit", version: "0.0.1" });

server.registerTool(
  "list_findings",
  {
    description:
      "List audit findings. Defaults to open findings ordered by severity (critical first). Use this to discover what needs remediation.",
    inputSchema: listFindingsSchema.shape,
  },
  async (input) => {
    const rows = await listFindings(input);
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerTool(
  "get_finding",
  {
    description:
      "Get full detail for a single finding including remediationGuide and current claim status.",
    inputSchema: getFindingSchema.shape,
  },
  async (input) => {
    const row = await getFinding(input);
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
  }
);

server.registerTool(
  "claim_finding",
  {
    description:
      "Claim a finding as in-progress so other agents know you're working on it. Provide a unique agentId (e.g. 'claude-code/session-abc' or 'worktree/fix-secrets').",
    inputSchema: claimFindingSchema.shape,
  },
  async (input) => {
    const row = await claimFinding(input);
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
  }
);

server.registerTool(
  "resolve_finding",
  {
    description:
      "Mark a finding as resolved. Include a resolutionNote describing what was done (e.g. 'Added branch protection rule requiring PR reviews').",
    inputSchema: resolveFindingSchema.shape,
  },
  async (input) => {
    const row = await resolveFinding(input);
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
  }
);

server.registerTool(
  "suppress_finding",
  {
    description:
      "Mark a finding as suppressed with a reason. Use when the finding is accepted risk or not applicable to this system.",
    inputSchema: suppressFindingSchema.shape,
  },
  async (input) => {
    const row = await suppressFinding(input);
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
  }
);

server.registerTool(
  "release_finding",
  {
    description:
      "Release an in-progress claim back to open. Use when abandoning work on a finding so another agent can pick it up.",
    inputSchema: releaseFindingSchema.shape,
  },
  async (input) => {
    const row = await releaseFinding(input);
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
