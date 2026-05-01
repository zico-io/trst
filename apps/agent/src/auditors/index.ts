import { runCodeAuditor } from "./code-auditor";
import { runProcessAuditor } from "./process-auditor";
import { runPolicyAuditor } from "./policy-auditor";
import type { AuditorResult } from "../types";

export interface RunAuditorsInput {
  repoFullName: string;
  githubToken: string;
  anthropicApiKey: string;
}

export async function runAllAuditors(input: RunAuditorsInput): Promise<AuditorResult[]> {
  const [codeResult, processResult, policyResult] = await Promise.all([
    runCodeAuditor(input.repoFullName, input.githubToken, input.anthropicApiKey),
    runProcessAuditor(input.repoFullName, input.githubToken),
    runPolicyAuditor(input.anthropicApiKey),
  ]);

  return [codeResult, processResult, policyResult];
}
