import { describe, expect, it } from "bun:test";
import {
  parseMappedFindingsFromToolResult,
  type GapMapperToolResponse,
} from "../gap-mapper";
import type { RawFinding } from "../types";

const rawFindings: RawFinding[] = [
  {
    severity: "high",
    category: "code",
    title: "Hardcoded secret",
    detail: "API key found in source.",
  },
  {
    severity: "medium",
    category: "process",
    title: "No branch protection",
    detail: "Default branch is unprotected.",
  },
];

const toolResponse: GapMapperToolResponse = {
  mappedFindings: [
    {
      findingIndex: 0,
      frameworkId: "soc2",
      controlRef: "SOC2 CC6.6",
      controlId: "CC6.6",
      controlStatus: "failing",
      remediationGuide: "Remove hardcoded secrets and use a secrets manager.",
    },
    {
      findingIndex: 1,
      frameworkId: "soc2",
      controlRef: "SOC2 CC8.1",
      controlId: "CC8.1",
      controlStatus: "failing",
      remediationGuide: "Enable branch protection with required reviews.",
    },
  ],
};

describe("parseMappedFindingsFromToolResult", () => {
  it("maps each raw finding by index", () => {
    const result = parseMappedFindingsFromToolResult(toolResponse, rawFindings);
    expect(result).toHaveLength(2);
    expect(result[0].rawFinding.title).toBe("Hardcoded secret");
    expect(result[0].controlId).toBe("CC6.6");
    expect(result[0].controlStatus).toBe("failing");
    expect(result[1].rawFinding.title).toBe("No branch protection");
    expect(result[1].frameworkId).toBe("soc2");
  });

  it("skips out-of-bounds findingIndex", () => {
    const badResponse: GapMapperToolResponse = {
      mappedFindings: [
        { findingIndex: 99, frameworkId: "soc2", controlRef: "SOC2 CC6.1", controlId: "CC6.1", controlStatus: "failing", remediationGuide: "Fix it." },
      ],
    };
    const result = parseMappedFindingsFromToolResult(badResponse, rawFindings);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty tool response", () => {
    const result = parseMappedFindingsFromToolResult({ mappedFindings: [] }, rawFindings);
    expect(result).toHaveLength(0);
  });
});
