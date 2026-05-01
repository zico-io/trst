import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const githubAppConfig = pgTable("github_app_config", {
  id: text("id").primaryKey().default("singleton"),
  appId: text("app_id"),
  appName: text("app_name"),
  privateKey: text("private_key"),
  webhookSecret: text("webhook_secret"),
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  installationId: text("installation_id"),
  installedAt: timestamp("installed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GitHubAppConfig = typeof githubAppConfig.$inferSelect;
