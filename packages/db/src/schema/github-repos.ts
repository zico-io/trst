import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const githubRepos = pgTable("github_repos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GitHubRepo = typeof githubRepos.$inferSelect;
