import { describe, expect, it } from "bun:test";
import {
  formatLinearTitle,
  formatLinearDescription,
} from "../issue-backends/linear";
import {
  formatGitHubTitle,
  formatGitHubBody,
  parseIssueNumber,
} from "../issue-backends/github";
import type { RawFinding } from "../types";

const finding: RawFinding = {
  severity: "high",
  category: "code",
  title: "Hardcoded API key found",
  detail: "An API key was found in src/config.ts on line 12.",
};

describe("LinearBackend formatting", () => {
  it("formatLinearTitle includes severity and title", () => {
    expect(formatLinearTitle(finding)).toBe("[HIGH] Hardcoded API key found");
  });

  it("formatLinearDescription includes all fields", () => {
    const desc = formatLinearDescription(finding);
    expect(desc).toContain("high");
    expect(desc).toContain("code");
    expect(desc).toContain("An API key was found");
  });
});

describe("GitHubBackend formatting", () => {
  it("formatGitHubTitle includes severity and title", () => {
    expect(formatGitHubTitle(finding)).toBe("[HIGH] Hardcoded API key found");
  });

  it("formatGitHubBody includes all fields", () => {
    const body = formatGitHubBody(finding);
    expect(body).toContain("high");
    expect(body).toContain("code");
    expect(body).toContain("An API key was found");
  });

  it("parseIssueNumber extracts the number from a URL", () => {
    expect(parseIssueNumber("https://github.com/org/repo/issues/42")).toBe(42);
  });

  it("parseIssueNumber throws on invalid URL", () => {
    expect(() => parseIssueNumber("https://github.com/org/repo")).toThrow();
  });
});
