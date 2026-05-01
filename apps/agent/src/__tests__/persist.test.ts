import { describe, expect, it } from "bun:test";
import { hashFinding } from "../persist";

describe("hashFinding", () => {
  it("returns an 8-char hex string", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "Hardcoded secret")).toMatch(/^[0-9a-f]{8}$/);
  });
  it("is deterministic", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "x")).toBe(hashFinding("repo-1", "soc2", "CC6.1", "x"));
  });
  it("differs for different controlRefs", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "x")).not.toBe(hashFinding("repo-1", "soc2", "CC6.2", "x"));
  });
  it("differs for different frameworkIds", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "x")).not.toBe(hashFinding("repo-1", "hipaa", "CC6.1", "x"));
  });
  it("differs for different repoIds", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "x")).not.toBe(hashFinding("repo-2", "soc2", "CC6.1", "x"));
  });
  it("same hash across runs for same repo+framework+control+title", () => {
    expect(hashFinding("repo-1", "soc2", "CC6.1", "x")).toBe(hashFinding("repo-1", "soc2", "CC6.1", "x"));
  });
});
