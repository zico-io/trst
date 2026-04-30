import type { ControlStatus, FrameworkId, FrameworkScore } from "@trst/shared";

/**
 * Computes a compliance score for a given framework.
 *
 * Percentage formula: (passing * 1 + partial * 0.5) / (total - notApplicable) * 100
 * Returns 0 when there are no applicable controls.
 *
 * @param controlStatuses - All control statuses (may include statuses for other frameworks).
 * @param frameworkId - The framework to score.
 */
export function scoreFramework(
  controlStatuses: ControlStatus[],
  frameworkId: FrameworkId,
): FrameworkScore {
  const relevant = controlStatuses.filter(
    (s) => s.frameworkId === frameworkId,
  );

  let passing = 0;
  let partial = 0;
  let failing = 0;
  let notApplicable = 0;

  for (const s of relevant) {
    switch (s.status) {
      case "passing":
        passing++;
        break;
      case "partial":
        partial++;
        break;
      case "failing":
        failing++;
        break;
      case "not-applicable":
        notApplicable++;
        break;
    }
  }

  const total = relevant.length;
  const applicable = total - notApplicable;
  const percentage =
    applicable === 0 ? 0 : ((passing * 1 + partial * 0.5) / applicable) * 100;

  return {
    frameworkId,
    percentage,
    passing,
    partial,
    failing,
    notApplicable,
    total,
  };
}
