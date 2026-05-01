import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformConfig = pgTable("platform_config", {
  id: text("id").primaryKey().default("singleton"),
  anthropicApiKey: text("anthropic_api_key"),
  issueBackend: text("issue_backend").$type<"linear" | "github" | "none">(),
  linearApiKey: text("linear_api_key"),
  linearTeamId: text("linear_team_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PlatformConfig = typeof platformConfig.$inferSelect;
