import { describe, expect, it } from "bun:test";
import type { ComplianceFramework, Control, ControlStatus, Finding } from "@trst/shared";
import { computeGap, deduplicateFindings } from "../gap-analysis";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeControl = (id: string, ref: string): Control => ({
  id,
  frameworkId: "soc2",
  ref,
  title: `Control ${ref}`,
  description: `Description for ${ref}`,
});

const miniSoc2: ComplianceFramework = {
  id: "soc2",
  name: "SOC 2",
  version: "2017",
  controls: [
    makeControl("soc2-cc6.1", "CC6.1"),
    makeControl("soc2-cc6.2", "CC6.2"),
    makeControl("soc2-cc6.3", "CC6.3"),
    makeControl("soc2-cc7.2", "CC7.2"),
  ],
};

const makeStatus = (controlId: string, status: ControlStatus["status"]): ControlStatus => ({
  frameworkId: "soc2",
  controlId,
  status,
  score: status === "passing" ? 1 : status === "partial" ? 0.5 : 0,
  lastAuditRunId: "run-1",
  updatedAt: new Date("2026-01-01T00:00:00Z"),
});

const makeFinding = (id: string, hash: string): Finding => ({
  id,
  auditRunId: "run-1",
  severity: "high",
  controlRef: "CC6.1",
  frameworkId: "soc2",
  title: `Finding ${id}`,
  detail: "Some detail",
  remediationGuide: "Fix it",
  hash,
  status: "open",
  createdAt: new Date("2026-01-01T00:00:00Z"),
});

// ── computeGap ────────────────────────────────────────────────────────────────

describe("computeGap", () => {
  it("identifies failing controls correctly", () => {
    const statuses: ControlStatus[] = [
      makeStatus("soc2-cc6.1", "passing"),
      makeStatus("soc2-cc6.2", "failing"),
      makeStatus("soc2-cc6.3", "failing"),
      makeStatus("soc2-cc7.2", "partial"),
    ];

    const report = computeGap(statuses, miniSoc2);

    expect(report.frameworkId).toBe("soc2");
    expect(report.failingControls).toHaveLength(2);
    expect(report.failingControls.map((c) => c.id)).toEqual(
      expect.arrayContaining(["soc2-cc6.2", "soc2-cc6.3"])
    );
  });

  it("identifies partial controls correctly", () => {
    const statuses: ControlStatus[] = [
      makeStatus("soc2-cc6.1", "passing"),
      makeStatus("soc2-cc6.2", "failing"),
      makeStatus("soc2-cc6.3", "partial"),
      makeStatus("soc2-cc7.2", "partial"),
    ];

    const report = computeGap(statuses, miniSoc2);

    expect(report.partialControls).toHaveLength(2);
    expect(report.partialControls.map((c) => c.id)).toEqual(
      expect.arrayContaining(["soc2-cc6.3", "soc2-cc7.2"])
    );
  });

  it("treats controls with no status as failing", () => {
    // Only cc6.1 has a status — the rest are missing (gap)
    const statuses: ControlStatus[] = [makeStatus("soc2-cc6.1", "passing")];

    const report = computeGap(statuses, miniSoc2);

    // cc6.2, cc6.3, cc7.2 have no status entry — they are failing gaps
    expect(report.failingControls).toHaveLength(3);
    expect(report.failingControls.map((c) => c.id)).toEqual(
      expect.arrayContaining(["soc2-cc6.2", "soc2-cc6.3", "soc2-cc7.2"])
    );
  });

  it("includes the framework score in the report", () => {
    const statuses: ControlStatus[] = [
      makeStatus("soc2-cc6.1", "passing"),
      makeStatus("soc2-cc6.2", "passing"),
      makeStatus("soc2-cc6.3", "failing"),
      makeStatus("soc2-cc7.2", "failing"),
    ];

    const report = computeGap(statuses, miniSoc2);

    // (2 * 1 + 0 * 0.5) / 4 * 100 = 50
    expect(report.score.percentage).toBe(50);
    expect(report.score.frameworkId).toBe("soc2");
  });

  it("returns empty gap arrays when all controls are passing", () => {
    const statuses: ControlStatus[] = miniSoc2.controls.map((c) => makeStatus(c.id, "passing"));

    const report = computeGap(statuses, miniSoc2);

    expect(report.failingControls).toHaveLength(0);
    expect(report.partialControls).toHaveLength(0);
    expect(report.score.percentage).toBe(100);
  });

  it("excludes not-applicable controls from gap lists", () => {
    const statuses: ControlStatus[] = [
      makeStatus("soc2-cc6.1", "passing"),
      makeStatus("soc2-cc6.2", "not-applicable"),
      makeStatus("soc2-cc6.3", "failing"),
      makeStatus("soc2-cc7.2", "passing"),
    ];

    const report = computeGap(statuses, miniSoc2);

    expect(report.failingControls.map((c) => c.id)).toEqual(["soc2-cc6.3"]);
    expect(report.partialControls).toHaveLength(0);
  });

  it("ignores statuses belonging to a different framework", () => {
    const statuses: ControlStatus[] = [
      makeStatus("soc2-cc6.1", "passing"),
      {
        frameworkId: "hipaa" as const,
        controlId: "soc2-cc6.2", // same controlId, different framework
        status: "passing",
        score: 1,
        lastAuditRunId: "run-1",
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      },
    ];

    const report = computeGap(statuses, miniSoc2);

    // soc2-cc6.2 has no soc2 status, so it should be a failing gap
    expect(report.failingControls.map((c) => c.id)).toEqual(
      expect.arrayContaining(["soc2-cc6.2", "soc2-cc6.3", "soc2-cc7.2"])
    );
  });
});

// ── deduplicateFindings ────────────────────────────────────────────────────────

describe("deduplicateFindings", () => {
  it("returns findings unchanged when there are no duplicates", () => {
    const findings: Finding[] = [
      makeFinding("f1", "abc123"),
      makeFinding("f2", "def456"),
      makeFinding("f3", "ghi789"),
    ];

    const result = deduplicateFindings(findings);

    expect(result).toHaveLength(3);
    expect(result.map((f) => f.id)).toEqual(["f1", "f2", "f3"]);
  });

  it("removes exact hash duplicates, keeping the first occurrence", () => {
    const findings: Finding[] = [
      makeFinding("f1", "abc123"),
      makeFinding("f2", "abc123"), // duplicate hash
      makeFinding("f3", "def456"),
    ];

    const result = deduplicateFindings(findings);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("f1"); // first occurrence kept
    expect(result[1].id).toBe("f3");
  });

  it("handles multiple groups of duplicates", () => {
    const findings: Finding[] = [
      makeFinding("f1", "hash-a"),
      makeFinding("f2", "hash-b"),
      makeFinding("f3", "hash-a"), // dup of f1
      makeFinding("f4", "hash-b"), // dup of f2
      makeFinding("f5", "hash-c"),
    ];

    const result = deduplicateFindings(findings);

    expect(result).toHaveLength(3);
    expect(result.map((f) => f.id)).toEqual(["f1", "f2", "f5"]);
  });

  it("returns an empty array for an empty input", () => {
    expect(deduplicateFindings([])).toEqual([]);
  });

  it("preserves insertion order of first occurrences", () => {
    const findings: Finding[] = [
      makeFinding("f3", "hash-z"),
      makeFinding("f1", "hash-a"),
      makeFinding("f2", "hash-z"), // dup of f3
      makeFinding("f4", "hash-a"), // dup of f1
    ];

    const result = deduplicateFindings(findings);

    // f3 came first in the array, so it is kept before f1
    expect(result.map((f) => f.id)).toEqual(["f3", "f1"]);
  });
});
