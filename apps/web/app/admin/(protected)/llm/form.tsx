"use client";

import { useTransition } from "react";
import { savePlatformConfig } from "../actions";

export function LlmForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const anthropicApiKey = fd.get("anthropicApiKey") as string;
    if (!anthropicApiKey.trim()) return;

    startTransition(async () => {
      await savePlatformConfig({ anthropicApiKey: anthropicApiKey.trim() });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="anthropicApiKey"
          className="block text-xs font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          New key
        </label>
        <input
          id="anthropicApiKey"
          name="anthropicApiKey"
          type="password"
          placeholder="sk-ant-api03-..."
          autoComplete="off"
          className="w-full rounded-lg px-3 py-2 text-sm font-mono border outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--color-bg)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#fff",
        }}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
