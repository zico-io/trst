/// <reference types="node" />
import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const policies = pgTable("policies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }).notNull(),
  contentPath: text("content_path").notNull(),
});

export const policyFrameworkMap = pgTable(
  "policy_framework_map",
  {
    policyId: text("policy_id")
      .notNull()
      .references(() => policies.id),
    frameworkId: text("framework_id").notNull(),
    controlIds: text("control_ids").array().notNull().default([]),
  },
  (t) => [primaryKey({ columns: [t.policyId, t.frameworkId] })]
);
