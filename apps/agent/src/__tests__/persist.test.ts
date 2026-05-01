import { describe, expect, it } from "bun:test";
import { hashFinding } from "../persist";

describe("hashFinding", () => {
  it("returns an 8-char hex string", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is deterministic", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).toBe(
      hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret"),
    );
  });

  it("differs for different controlRefs", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).not.toBe(
      hashFinding("repo-1", "soc2", "CC6.2", "Hardcoded secret"),
    );
  });

  it("differs for different frameworkIds", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).not.toBe(
      hashFinding("repo-1", "hipaa", "CC6.1", "Hardcoded secret"),
    );
  });

  it("differs for different repoIds", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).not.toBe(
      hashFinding("repo-2", "soc2", "CC6.1", "Hardcoded secret"),
    );
  });

  it("same hash across runs for same repo+framework+control+title", () => {
    // Two audit runs for the same repo must produce the same hash (auditRunId is not in the key)
    const hashFromRun1 = hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret");
    const hashFromRun2 = hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret");
    expect(hashFromRun1).toBe(hashFromRun2);
  });
});
