import { db, platformConfig } from "@trst/db";
import { IssueBackendForm } from "./form";

export default async function IssueBackendPage() {
  const [config] = await db.select().from(platformConfig).limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Issue Backend
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Where audit findings get filed as issues.
        </p>
      </div>

      <section
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <IssueBackendForm
          current={{
            issueBackend: (config?.issueBackend ?? "none") as "linear" | "github" | "none",
            linearApiKey: config?.linearApiKey ?? "",
            linearTeamId: config?.linearTeamId ?? "",
          }}
        />
      </section>
    </div>
  );
}
