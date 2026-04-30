/// <reference types="node" />
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const certifications = pgTable("certifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  frameworkId: text("framework_id").notNull(),
  auditor: text("auditor").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validThrough: timestamp("valid_through", { withTimezone: true }).notNull(),
  reportUrl: text("report_url"),
});
