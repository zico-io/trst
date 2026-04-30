export type FrameworkId = "hipaa" | "soc2" | "gdpr" | "iso27001" | "hitrust";

export interface Control {
  id: string;
  frameworkId: FrameworkId;
  ref: string; // e.g. "CC6.1", "§164.312(a)(1)"
  title: string;
  description: string;
}

export interface ComplianceFramework {
  id: FrameworkId;
  name: string;
  version: string;
  controls: Control[];
}

export interface FrameworkScore {
  frameworkId: FrameworkId;
  percentage: number;
  passing: number;
  partial: number;
  failing: number;
  notApplicable: number;
  total: number;
}
