import type {
  ComplianceFramework,
  Control,
  ControlStatus,
  Finding,
  FrameworkId,
  FrameworkScore,
} from "@trst/shared";
import { scoreFramework } from "./scoring";

export interface GapReport {
  frameworkId: FrameworkId;
  failingControls: Control[];
  partialControls: Control[];
  score: FrameworkScore;
}

/**
 * Computes a gap report for a framework by cross-referencing control statuses
 * against the framework catalog.
 *
 * Controls with no status entry are treated as failing (unassessed gap).
 * Controls marked not-applicable are excluded from both gap lists.
 *
 * @param controlStatuses - All control statuses (may include other frameworks).
 *   If duplicate (controlId, frameworkId) pairs are present, the last occurrence wins.
 * @param framework - The framework catalog to compare against.
 */
export function computeGap(
  controlStatuses: ControlStatus[],
  framework: ComplianceFramework,
): GapReport {
  const statusByControlId = new Map<string, ControlStatus["status"]>();

  for (const s of controlStatuses) {
    if (s.frameworkId === framework.id) {
      statusByControlId.set(s.controlId, s.status);
    }
  }

  const failingControls: Control[] = [];
  const partialControls: Control[] = [];

  for (const control of framework.controls) {
    const status = statusByControlId.get(control.id);

    if (status === undefined) {
      // No status entry means unassessed — treated as a failing gap
      failingControls.push(control);
      continue;
    }

    switch (status) {
      case "failing":
        failingControls.push(control);
        break;
      case "partial":
        partialControls.push(control);
        break;
      case "passing":
      case "not-applicable":
        // Excluded from gap lists
        break;
      default: {
        const _exhaustive: never = status;
        throw new Error(`Unhandled control status in gap analysis: ${_exhaustive}`);
      }
    }
  }

  const score = scoreFramework(controlStatuses, framework.id);

  return {
    frameworkId: framework.id,
    failingControls,
    partialControls,
    score,
  };
}

/**
 * Removes duplicate findings by SHA-256 hash, keeping the first occurrence
 * in insertion order.
 *
 * @param findings - Array of findings that may contain hash duplicates.
 */
export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const result: Finding[] = [];

  for (const finding of findings) {
    if (!seen.has(finding.hash)) {
      seen.add(finding.hash);
      result.push(finding);
    }
  }

  return result;
}
