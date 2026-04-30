import { integer, pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { auditRuns } from "./audit-runs";

export const controlStatusValueEnum = pgEnum("control_status_value", [
  "passing",
  "partial",
  "failing",
  "not-applicable",
]);

export const controlStatuses = pgTable(
  "control_statuses",
  {
    frameworkId: text("framework_id").notNull(),
    controlId: text("control_id").notNull(),
    status: controlStatusValueEnum("status").notNull(),
    score: integer("score").notNull().default(0),
    lastAuditRunId: text("last_audit_run_id")
      .notNull()
      .references(() => auditRuns.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.frameworkId, t.controlId] })]
);
