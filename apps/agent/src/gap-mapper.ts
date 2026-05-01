import Anthropic from "@anthropic-ai/sdk";
import type { FrameworkId } from "@trst/shared";
import { withLlmSpan } from "@trst/telemetry";
import type { RawFinding, MappedFinding } from "./types";

// Tool definition for structured output
const MAP_FINDINGS_TOOL: Anthropic.Messages.Tool = {
  name: "map_findings",
  description:
    "Map each raw compliance finding to a specific framework control ref and score the control's status.",
  input_schema: {
    type: "object",
    properties: {
      mappedFindings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            findingIndex: {
              type: "number",
              description: "Zero-based index into the input findings array",
            },
            frameworkId: {
              type: "string",
              enum: ["hipaa", "soc2", "gdpr", "iso27001", "hitrust"],
              description: "The compliance framework this finding maps to",
            },
            controlRef: {
              type: "string",
              description: "Human-readable control reference, e.g. SOC2 CC6.1 or HIPAA 164.312(a)(1)",
            },
            controlId: {
              type: "string",
              description: "Machine-readable control ID, e.g. CC6.1 or 164.312(a)(1)",
            },
            controlStatus: {
              type: "string",
              enum: ["passing", "partial", "failing", "not-applicable"],
              description: "Current status of this control based on the finding",
            },
            remediationGuide: {
              type: "string",
              description: "3-5 sentence actionable remediation guide for this specific finding",
            },
          },
          required: [
            "findingIndex",
            "frameworkId",
            "controlRef",
            "controlId",
            "controlStatus",
            "remediationGuide",
          ],
        },
      },
    },
    required: ["mappedFindings"],
  },
};

const FRAMEWORK_CATALOG = `
SOC 2: CC6.1 (Logical access), CC6.6 (Encryption), CC7.2 (Monitoring), CC8.1 (Change management), CC9.1 (Risk assessment), CC9.2 (Vendor risk), A1.1 (Availability)
HIPAA: 164.308(a)(1) (Security management), 164.308(a)(5) (Training), 164.312(a)(1) (Access control), 164.312(e)(1) (Transmission security), 164.312(b) (Audit controls)
GDPR: Art.5 (Processing principles), Art.13 (Transparency), Art.25 (Privacy by design), Art.32 (Security), Art.33 (Breach notification)
ISO 27001: A.9.1 (Access control policy), A.9.2 (User access management), A.10.1 (Cryptographic controls), A.12.1.2 (Change management), A.12.6.1 (Technical vulnerability management)
HITRUST: 01.a (Access control policy), 06.d (Data classification), 09.ab (Monitoring), 10.b (Application security)
`.trim();

export interface GapMapperInput {
  rawFindings: RawFinding[];
  anthropicApiKey: string;
}

export interface GapMapperToolResponse {
  mappedFindings: Array<{
    findingIndex: number;
    frameworkId: string;
    controlRef: string;
    controlId: string;
    controlStatus: string;
    remediationGuide: string;
  }>;
}

// Pure function — exported for unit testing
export function parseMappedFindingsFromToolResult(
  toolInput: GapMapperToolResponse,
  rawFindings: RawFinding[]
): MappedFinding[] {
  const results: MappedFinding[] = [];

  for (const mapped of toolInput.mappedFindings) {
    const rawFinding = rawFindings[mapped.findingIndex];
    if (!rawFinding) continue;

    results.push({
      rawFinding,
      frameworkId: mapped.frameworkId as FrameworkId,
      controlRef: mapped.controlRef,
      controlId: mapped.controlId,
      controlStatus: mapped.controlStatus as MappedFinding["controlStatus"],
      remediationGuide: mapped.remediationGuide,
    });
  }

  return results;
}

export async function runGapMapper(input: GapMapperInput): Promise<MappedFinding[]> {
  if (input.rawFindings.length === 0) return [];

  const anthropic = new Anthropic({ apiKey: input.anthropicApiKey });

  const findingsText = input.rawFindings
    .map(
      (f, i) =>
        `[${i}] severity=${f.severity} category=${f.category}\n  title: ${f.title}\n  detail: ${f.detail}`
    )
    .join("\n\n");

  const response = await withLlmSpan({ model: "claude-sonnet-4-6", operation: "gap-map" }, () => anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    tools: [MAP_FINDINGS_TOOL],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `You are a compliance engineer. Map each of the following raw findings to the most appropriate framework control, determine the control's current status, and provide a remediation guide.

## Framework Control Catalog
${FRAMEWORK_CATALOG}

## Raw Findings (${input.rawFindings.length} total)
${findingsText}

Call the map_findings tool with all findings mapped. Every finding must appear in the output — use findingIndex to reference each one.`,
      },
    ],
  }));

  // Extract the tool_use block
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUseBlock) {
    throw new Error("GapMapper: Claude did not return a tool_use block");
  }

  const toolInput = toolUseBlock.input as GapMapperToolResponse;
  return parseMappedFindingsFromToolResult(toolInput, input.rawFindings);
}
