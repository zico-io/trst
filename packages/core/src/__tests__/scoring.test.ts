import { describe, expect, it } from "bun:test";
import type { ControlStatus } from "@trst/shared";
import { scoreFramework } from "../scoring";

const makeStatus = (
  controlId: string,
  status: ControlStatus["status"],
  score: number,
): ControlStatus => ({
  frameworkId: "soc2",
  controlId,
  status,
  score,
  lastAuditRunId: "run-1",
  updatedAt: new Date("2026-01-01T00:00:00Z"),
});

describe("scoreFramework", () => {
  it("returns 100% when all controls are passing", () => {
    const statuses: ControlStatus[] = [
      makeStatus("cc6.1", "passing", 1),
      makeStatus("cc6.2", "passing", 1),
      makeStatus("cc6.3", "passing", 1),
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.frameworkId).toBe("soc2");
    expect(result.passing).toBe(3);
    expect(result.partial).toBe(0);
    expect(result.failing).toBe(0);
    expect(result.notApplicable).toBe(0);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(100);
  });

  it("computes correct percentage for a mix of passing, partial, and failing", () => {
    const statuses: ControlStatus[] = [
      makeStatus("cc6.1", "passing", 1),   // +1.0
      makeStatus("cc6.2", "partial", 0.5), // +0.5
      makeStatus("cc6.3", "failing", 0),   // +0.0
      makeStatus("cc6.7", "failing", 0),   // +0.0
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.passing).toBe(1);
    expect(result.partial).toBe(1);
    expect(result.failing).toBe(2);
    expect(result.notApplicable).toBe(0);
    expect(result.total).toBe(4);
    // (1 * 1 + 1 * 0.5) / (4 - 0) * 100 = 1.5 / 4 * 100 = 37.5
    expect(result.percentage).toBe(37.5);
  });

  it("excludes not-applicable controls from the denominator", () => {
    const statuses: ControlStatus[] = [
      makeStatus("cc6.1", "passing", 1),
      makeStatus("cc6.2", "passing", 1),
      makeStatus("cc6.3", "not-applicable", 0),
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.passing).toBe(2);
    expect(result.notApplicable).toBe(1);
    expect(result.total).toBe(3);
    // (2 * 1 + 0 * 0.5) / (3 - 1) * 100 = 2 / 2 * 100 = 100
    expect(result.percentage).toBe(100);
  });

  it("returns 0% when all applicable controls are failing", () => {
    const statuses: ControlStatus[] = [
      makeStatus("cc6.1", "failing", 0),
      makeStatus("cc6.2", "failing", 0),
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.percentage).toBe(0);
  });

  it("returns 0% when there are no applicable controls", () => {
    const statuses: ControlStatus[] = [
      makeStatus("cc6.1", "not-applicable", 0),
      makeStatus("cc6.2", "not-applicable", 0),
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.total).toBe(2);
    expect(result.notApplicable).toBe(2);
    expect(result.percentage).toBe(0);
  });

  it("filters out statuses belonging to a different frameworkId", () => {
    const statuses: ControlStatus[] = [
      { ...makeStatus("cc6.1", "passing", 1), frameworkId: "soc2" },
      { ...makeStatus("164.306-a-1", "failing", 0), frameworkId: "hipaa" },
    ];

    const result = scoreFramework(statuses, "soc2");

    expect(result.total).toBe(1);
    expect(result.passing).toBe(1);
    expect(result.percentage).toBe(100);
  });

  it("returns an empty score when no statuses match the frameworkId", () => {
    const result = scoreFramework([], "gdpr");

    expect(result.frameworkId).toBe("gdpr");
    expect(result.total).toBe(0);
    expect(result.percentage).toBe(0);
  });
});
