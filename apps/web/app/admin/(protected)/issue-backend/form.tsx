"use client";

import { useTransition, useState } from "react";
import { savePlatformConfig } from "../actions";

interface Props {
  current: {
    issueBackend: "linear" | "github" | "none";
    linearApiKey: string;
    linearTeamId: string;
  };
}

export function IssueBackendForm({ current }: Props) {
  const [pending, startTransition] = useTransition();
  const [backend, setBackend] = useState(current.issueBackend);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      await savePlatformConfig({
        issueBackend: backend,
        linearApiKey: (fd.get("linearApiKey") as string) || undefined,
        linearTeamId: (fd.get("linearTeamId") as string) || undefined,
      });
    });
  }

  const radioClass = (active: boolean) =>
    [
      "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
      active ? "border-[var(--color-accent)]" : "border-[var(--color-border)]",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        {(["none", "linear", "github"] as const).map((b) => (
          <label key={b} className={radioClass(backend === b)}>
            <input
              type="radio"
              name="backend"
              value={b}
              checked={backend === b}
              onChange={() => setBackend(b)}
              className="sr-only"
            />
            <span
              className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: backend === b ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              {backend === b && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </span>
            <span
              className="text-sm font-medium capitalize"
              style={{ color: "var(--color-text-primary)" }}
            >
              {b === "none" ? "Disabled" : b === "linear" ? "Linear" : "GitHub Issues"}
            </span>
          </label>
        ))}
      </div>

      {backend === "linear" && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label
              htmlFor="linearApiKey"
              className="block text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Linear API Key
            </label>
            <input
              id="linearApiKey"
              name="linearApiKey"
              type="password"
              defaultValue={current.linearApiKey}
              placeholder="lin_api_..."
              className="w-full rounded-lg px-3 py-2 text-sm font-mono border outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="linearTeamId"
              className="block text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Linear Team ID
            </label>
            <input
              id="linearTeamId"
              name="linearTeamId"
              type="text"
              defaultValue={current.linearTeamId}
              placeholder="TEAM-ID"
              className="w-full rounded-lg px-3 py-2 text-sm font-mono border outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
