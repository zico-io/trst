"use client";

import { useTransition } from "react";
import { saveGitHubAppConfig } from "../actions";

interface Props {
  current: {
    appId: string;
    appName: string;
    webhookSecret: string;
    clientId: string;
  };
  hasPrivateKey: boolean;
  hasClientSecret: boolean;
  installationId: string | null;
}

export function GitHubAppForm({ current, hasPrivateKey, hasClientSecret, installationId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const data: Parameters<typeof saveGitHubAppConfig>[0] = {};
    const appId = fd.get("appId") as string;
    const appName = fd.get("appName") as string;
    const privateKey = fd.get("privateKey") as string;
    const webhookSecret = fd.get("webhookSecret") as string;
    const clientId = fd.get("clientId") as string;
    const clientSecret = fd.get("clientSecret") as string;

    if (appId.trim()) data.appId = appId.trim();
    if (appName.trim()) data.appName = appName.trim();
    if (privateKey.trim()) data.privateKey = privateKey.trim();
    if (webhookSecret.trim()) data.webhookSecret = webhookSecret.trim();
    if (clientId.trim()) data.clientId = clientId.trim();
    if (clientSecret.trim()) data.clientSecret = clientSecret.trim();

    startTransition(async () => {
      await saveGitHubAppConfig(data);
    });
  }

  const inputClass =
    "w-full rounded-lg px-3 py-2 text-sm font-mono border outline-none focus:ring-1 focus:ring-[var(--color-accent)]";
  const inputStyle = {
    backgroundColor: "var(--color-bg)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
  };
  const labelClass = "block text-xs font-medium mb-1";
  const labelStyle = { color: "var(--color-text-secondary)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="appId" className={labelClass} style={labelStyle}>
            App ID
          </label>
          <input
            id="appId"
            name="appId"
            type="text"
            defaultValue={current.appId}
            placeholder="123456"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="appName" className={labelClass} style={labelStyle}>
            App Slug
          </label>
          <input
            id="appName"
            name="appName"
            type="text"
            defaultValue={current.appName}
            placeholder="my-compliance-app"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="privateKey" className={labelClass} style={labelStyle}>
          Private Key (PEM)
          {hasPrivateKey && (
            <span className="ml-2 text-[var(--color-green)]">✓ set</span>
          )}
        </label>
        <textarea
          id="privateKey"
          name="privateKey"
          rows={4}
          placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
          className={`${inputClass} resize-y`}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clientId" className={labelClass} style={labelStyle}>
            OAuth Client ID
          </label>
          <input
            id="clientId"
            name="clientId"
            type="text"
            defaultValue={current.clientId}
            placeholder="Iv1.abc123"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="clientSecret" className={labelClass} style={labelStyle}>
            OAuth Client Secret
            {hasClientSecret && (
              <span className="ml-2 text-[var(--color-green)]">✓ set</span>
            )}
          </label>
          <input
            id="clientSecret"
            name="clientSecret"
            type="password"
            placeholder="leave blank to keep current"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="webhookSecret" className={labelClass} style={labelStyle}>
          Webhook Secret
        </label>
        <input
          id="webhookSecret"
          name="webhookSecret"
          type="password"
          defaultValue={current.webhookSecret}
          placeholder="leave blank to keep current"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
        >
          {pending ? "Saving…" : "Save Credentials"}
        </button>

        {current.appName && (
          <a
            href="/api/github/install/start"
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            {installationId ? "Re-install App →" : "Install App on GitHub →"}
          </a>
        )}
      </div>
    </form>
  );
}
