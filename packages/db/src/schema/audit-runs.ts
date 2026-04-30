/// <reference types="node" />
import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const auditRunStatusEnum = pgEnum("audit_run_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const auditRuns = pgTable("audit_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  repoId: text("repo_id").notNull(),
  status: auditRunStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
});
