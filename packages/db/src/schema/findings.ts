/// <reference types="node" />
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { auditRuns } from "./audit-runs";

export const findingSeverityEnum = pgEnum("finding_severity", [
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "open",
  "resolved",
  "suppressed",
]);

export const findings = pgTable("findings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  auditRunId: text("audit_run_id")
    .notNull()
    .references(() => auditRuns.id),
  severity: findingSeverityEnum("severity").notNull(),
  controlRef: text("control_ref").notNull(),
  frameworkId: text("framework_id").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  remediationGuide: text("remediation_guide").notNull(),
  hash: text("hash").notNull().unique(),
  status: findingStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
