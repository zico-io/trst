import { db, platformConfig } from "@trst/db";
import { LlmForm } from "./form";

export default async function LlmPage() {
  const [config] = await db.select().from(platformConfig).limit(1);

  const masked = config?.anthropicApiKey
    ? `sk-ant-...${config.anthropicApiKey.slice(-4)}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          LLM Keys
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          API keys for the language models used by the audit agent.
        </p>
      </div>

      <section
        className="rounded-xl border p-6 space-y-5"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <h2
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Anthropic API Key
          </h2>
          {masked && (
            <p className="mt-1 text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
              Current: {masked}
            </p>
          )}
        </div>
        <LlmForm />
      </section>
    </div>
  );
}
