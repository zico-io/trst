import { db, githubAppConfig } from "@trst/db";
import { GitHubAppForm } from "./form";
import { SetupGuide } from "./setup-guide";

export default async function GitHubPage({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string }>;
}) {
  const params = await searchParams;
  const [config] = await db.select().from(githubAppConfig).limit(1);
  const baseUrl = process.env.NEXTAUTH_URL ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          GitHub App
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Configure the GitHub App used to access repositories and create issues.
        </p>
      </div>

      {params.installed === "1" && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-green-bg)",
            borderColor: "var(--color-green-border)",
            color: "var(--color-green)",
          }}
        >
          GitHub App installed successfully.
        </div>
      )}

      {config?.installationId && (
        <div
          className="rounded-lg border px-4 py-3 text-sm space-y-1"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-green-border)",
          }}
        >
          <p className="font-medium" style={{ color: "var(--color-green)" }}>
            App installed
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            Installation ID: {config.installationId}
          </p>
          {config.installedAt && (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Installed {config.installedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "1fr 340px" }}>
        <section
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2 className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            App Credentials
          </h2>
          <GitHubAppForm
            current={{
              appId: config?.appId ?? "",
              appName: config?.appName ?? "",
              webhookSecret: config?.webhookSecret ?? "",
              clientId: config?.clientId ?? "",
            }}
            hasPrivateKey={Boolean(config?.privateKey)}
            hasClientSecret={Boolean(config?.clientSecret)}
            installationId={config?.installationId ?? null}
          />
        </section>

        <div className="sticky top-8">
          <SetupGuide baseUrl={baseUrl} />
        </div>
      </div>
    </div>
  );
}
