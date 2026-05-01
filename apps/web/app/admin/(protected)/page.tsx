import Link from "next/link";
import { db, auditRuns, desc } from "@trst/db";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminOverviewPage() {
  const recentRuns = await db
    .select()
    .from(auditRuns)
    .orderBy(desc(auditRuns.startedAt))
    .limit(10);

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Overview
      </h1>

      <section
        className="rounded-xl border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="px-5 py-4 border-b text-sm font-medium"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          Recent Audit Runs
        </div>

        {recentRuns.length === 0 ? (
          <div
            className="px-5 py-8 text-sm text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            No audit runs yet. Connect a repo and trigger one from the Repos page.
          </div>
        ) : (
          <ul className="py-2">
            {recentRuns.map((run) => (
              <li key={run.id} className={run.status === "running" ? "relative" : ""}>
                {run.status === "running" && (
                  <span className="absolute left-0 inset-y-0 w-0.5 rounded-r-full bg-amber-400/35" />
                )}
                <Link
                  href={`/admin/audits/${run.id}`}
                  className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${run.status === "running" ? "bg-amber-400/[0.025] hover:bg-amber-400/[0.04]" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <p
                      className="text-sm font-mono truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {run.repoId}
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {run.startedAt.toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={run.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
