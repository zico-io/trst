import { describe, expect, it } from "bun:test";
import { hashFinding } from "../persist";

describe("hashFinding", () => {
  it("returns a hex string", () => {
    const hash = hashFinding("run-1", "CC6.1", "Hardcoded secret");
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is deterministic", () => {
    const a = hashFinding("run-1", "CC6.1", "Hardcoded secret");
    const b = hashFinding("run-1", "CC6.1", "Hardcoded secret");
    expect(a).toBe(b);
  });

  it("differs for different inputs", () => {
    const a = hashFinding("run-1", "CC6.1", "Hardcoded secret");
    const b = hashFinding("run-1", "CC6.2", "Hardcoded secret");
    expect(a).not.toBe(b);
  });

  it("differs when auditRunId changes", () => {
    const a = hashFinding("run-1", "CC6.1", "Hardcoded secret");
    const b = hashFinding("run-2", "CC6.1", "Hardcoded secret");
    expect(a).not.toBe(b);
  });
});
