import { db, githubRepos } from "@trst/db";
import { ReposClient } from "./client";

export default async function ReposPage() {
  const repos = await db.select().from(githubRepos).orderBy(githubRepos.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Repos
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage which repositories are audited.
        </p>
      </div>

      <ReposClient repos={repos} />
    </div>
  );
}
