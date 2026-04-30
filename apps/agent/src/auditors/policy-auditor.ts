import Anthropic from "@anthropic-ai/sdk";
import { db } from "@trst/db";
import { policies } from "@trst/db/schema";
import type { RawFinding, AuditorResult } from "../types";

// The canonical control IDs we check coverage for across all frameworks
const REQUIRED_CONTROLS = [
  { frameworkId: "soc2", controlId: "CC6.1", description: "Logical access controls" },
  { frameworkId: "soc2", controlId: "CC6.6", description: "Encryption of data at rest and in transit" },
  { frameworkId: "soc2", controlId: "CC7.2", description: "System monitoring and anomaly detection" },
  { frameworkId: "soc2", controlId: "CC8.1", description: "Change management" },
  { frameworkId: "soc2", controlId: "CC9.1", description: "Risk assessment" },
  { frameworkId: "hipaa", controlId: "164.308(a)(1)", description: "Security management process" },
  { frameworkId: "hipaa", controlId: "164.308(a)(5)", description: "Security awareness and training" },
  { frameworkId: "hipaa", controlId: "164.312(a)(1)", description: "Access control" },
  { frameworkId: "hipaa", controlId: "164.312(e)(1)", description: "Transmission security" },
  { frameworkId: "gdpr", controlId: "Art.32", description: "Security of processing" },
  { frameworkId: "gdpr", controlId: "Art.13", description: "Information to be provided to data subjects" },
  { frameworkId: "iso27001", controlId: "A.9.1", description: "Access control policy" },
  { frameworkId: "iso27001", controlId: "A.12.6.1", description: "Management of technical vulnerabilities" },
];

export async function runPolicyAuditor(anthropicApiKey: string): Promise<AuditorResult> {
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });
  const findings: RawFinding[] = [];

  // Load all policy slugs from the DB
  const allPolicies = await db.select({ slug: policies.slug, title: policies.title }).from(policies);

  if (allPolicies.length === 0) {
    findings.push({
      severity: "high",
      category: "policy",
      title: "No policies found in the database",
      detail: "No policy documents are registered in the trst policy library. Without documented policies, the organization cannot demonstrate compliance with any framework control that requires policy evidence.",
    });
    return { auditor: "policy", findings };
  }

  const policyList = allPolicies.map((p) => `- slug: ${p.slug}`).join("\n");
  const controlList = REQUIRED_CONTROLS
    .map((c) => `- [${c.frameworkId}] ${c.controlId}: ${c.description}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a compliance policy analyst. Given a list of policy slugs and a list of required framework controls, identify which controls are NOT covered by any existing policy.

## Existing Policy Slugs
${policyList}

## Required Controls
${controlList}

For each control that is NOT covered by any policy slug, return a JSON finding. Coverage means the policy slug plausibly addresses the control's topic (e.g., "access-control-policy" covers SOC2 CC6.1).

Return a JSON array. Each element must have:
- severity: "critical" | "high" | "medium" | "low" | "info"
- frameworkId: the framework (e.g. "soc2")
- controlId: the control ID (e.g. "CC6.1")
- title: "Policy gap: <control description>"
- detail: 2-3 sentences explaining what policy is missing and why it matters

Return ONLY valid JSON — no markdown, no explanation.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const parsed = JSON.parse(text) as Array<{
      severity: string;
      frameworkId: string;
      controlId: string;
      title: string;
      detail: string;
    }>;
    for (const f of parsed) {
      findings.push({
        severity: f.severity as RawFinding["severity"],
        category: "policy",
        title: f.title,
        detail: f.detail,
      });
    }
  } catch {
    // Claude returned non-JSON — skip policy findings for this run
  }

  return { auditor: "policy", findings };
}
