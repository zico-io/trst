// Framework catalogs
export { hipaa, soc2, gdpr, iso27001, hitrust, frameworks } from "./frameworks";

// Scoring engine
export { scoreFramework } from "./scoring";

// Gap analysis
export { computeGap, deduplicateFindings } from "./gap-analysis";
export type { GapReport } from "./gap-analysis";
