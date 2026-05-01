"use client";

import { useTransition, useState } from "react";
import { addRepo, toggleRepo, removeRepo, triggerAudit } from "../actions";
import type { GitHubRepo } from "@trst/db";

export function ReposClient({ repos }: { repos: GitHubRepo[] }) {
  const [pending, startTransition] = useTransition();
  const [newRepo, setNewRepo] = useState("");
  const [auditStatus, setAuditStatus] = useState<Record<string, string>>({});

  function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = newRepo.trim();
    if (!value || !value.includes("/")) return;

    startTransition(async () => {
      await addRepo(value);
      setNewRepo("");
    });
  }

  function handleToggle(id: string, enabled: boolean) {
    startTransition(async () => {
      await toggleRepo(id, !enabled);
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeRepo(id);
    });
  }

  function handleAudit(repo: GitHubRepo) {
    startTransition(async () => {
      setAuditStatus((s) => ({ ...s, [repo.id]: "triggering…" }));
      try {
        const result = await triggerAudit(repo.id, repo.fullName);
        setAuditStatus((s) => ({
          ...s,
          [repo.id]: `Run ${result.auditRunId.slice(0, 8)} — ${result.status}`,
        }));
      } catch (err) {
        setAuditStatus((s) => ({
          ...s,
          [repo.id]: `Error: ${err instanceof Error ? err.message : "unknown"}`,
        }));
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Add repo */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder="owner/repo"
          className="flex-1 rounded-lg px-3 py-2 text-sm font-mono border outline-none"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
        >
          Add
        </button>
      </form>

      {/* Repo list */}
      {repos.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "var(--color-text-muted)" }}>
          No repos yet. Add one above.
        </p>
      ) : (
        <ul
          className="divide-y rounded-xl border overflow-hidden"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="px-5 py-4 flex flex-wrap items-center gap-3"
            >
              <span
                className="flex-1 text-sm font-mono font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {repo.fullName}
              </span>

              {auditStatus[repo.id] && (
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {auditStatus[repo.id]}
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAudit(repo)}
                  disabled={pending || !repo.enabled}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Run Audit
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(repo.id, repo.enabled)}
                  disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                  style={{
                    borderColor: repo.enabled
                      ? "var(--color-green-border)"
                      : "var(--color-border)",
                    color: repo.enabled
                      ? "var(--color-green)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {repo.enabled ? "Enabled" : "Disabled"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(repo.id)}
                  disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "#ef4444",
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
