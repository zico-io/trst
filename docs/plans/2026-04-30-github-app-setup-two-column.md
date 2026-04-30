# GitHub App Setup Two-Column Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky right-hand Setup Guide column to `/admin/github` that shows numbered steps with real URLs filled in from `NEXTAUTH_URL`.

**Architecture:** Pure Server Component change — no new client code. A new `SetupGuide` component receives `baseUrl` as a prop and renders a timeline. The GitHub page restructures its JSX into a two-column grid. The shared admin layout gets a wider max-width to accommodate the second column.

**Tech Stack:** Next.js 15 App Router (Server Components), Tailwind CSS v4, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/web/app/admin/(protected)/layout.tsx` | Modify line 79 | Widen container from `max-w-3xl` to `max-w-5xl` |
| `apps/web/app/admin/(protected)/github/setup-guide.tsx` | **Create** | Presentational timeline component — receives `baseUrl: string`, renders 6 steps |
| `apps/web/app/admin/(protected)/github/page.tsx` | Modify | Read `NEXTAUTH_URL`, wrap content in two-column grid, render `<SetupGuide>` |

---

### Task 1: Widen the admin layout container

**Files:**
- Modify: `apps/web/app/admin/(protected)/layout.tsx:79`

- [ ] **Step 1: Open the layout file and find the container div**

In `apps/web/app/admin/(protected)/layout.tsx`, line 79:
```tsx
<div className="max-w-3xl mx-auto px-8 py-8">{children}</div>
```

- [ ] **Step 2: Change `max-w-3xl` to `max-w-5xl`**

```tsx
<div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
```

- [ ] **Step 3: Typecheck**

```bash
cd apps/web && bun run typecheck
```

Expected: no errors related to this file.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/admin/\(protected\)/layout.tsx
git commit -m "feat(web): widen admin layout container to max-w-5xl"
```

---

### Task 2: Create the SetupGuide component

**Files:**
- Create: `apps/web/app/admin/(protected)/github/setup-guide.tsx`

- [ ] **Step 1: Create the file with the full component**

```tsx
interface Props {
  baseUrl: string;
}

interface Step {
  n: number;
  heading: string;
  detail?: string;
  code?: string;
  codeColor?: string;
  dimmed?: boolean;
}

const dotStyle = {
  green: {
    backgroundColor: "var(--color-green-bg)",
    color: "var(--color-green)",
    borderColor: "var(--color-green-border)",
  },
  blue: {
    backgroundColor: "var(--color-accent-bg, #1e3a5f)",
    color: "var(--color-accent)",
    borderColor: "var(--color-accent)",
  },
  muted: {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-muted)",
    borderColor: "var(--color-border)",
  },
} as const;

export function SetupGuide({ baseUrl }: Props) {
  const steps: Step[] = [
    {
      n: 1,
      heading: "Create a GitHub App",
      detail: "Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.",
      code: "github.com/settings/apps/new",
      codeColor: "var(--color-accent)",
    },
    {
      n: 2,
      heading: "Set the Setup URL",
      detail: "GitHub calls this endpoint after the app is installed.",
      code: `${baseUrl}/api/github/install`,
    },
    {
      n: 3,
      heading: "Set OAuth Callback URL",
      detail: "Required for the admin login flow.",
      code: `${baseUrl}/api/auth/callback/github`,
    },
    {
      n: 4,
      heading: "Enable repository permissions",
      detail: "Contents: Read-only · Issues: Read & write · Metadata: Read-only",
    },
    {
      n: 5,
      heading: "Download private key & copy credentials",
      detail: "Generate a private key from the app's settings page. Copy App ID, Client ID, Client Secret, and Webhook Secret into the form.",
    },
    {
      n: 6,
      heading: "Install the app",
      detail: 'The "Install App" button appears after saving credentials.',
      dimmed: true,
    },
  ];

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Setup Guide
      </h2>

      <ol className="relative" style={{ paddingLeft: "0" }}>
        {/* vertical line */}
        <div
          className="absolute"
          style={{
            left: "9px",
            top: "20px",
            bottom: "8px",
            width: "1px",
            backgroundColor: "var(--color-border)",
          }}
          aria-hidden
        />

        {steps.map((step) => {
          const dotVariant = step.dimmed ? "muted" : step.n === 1 ? "green" : "blue";

          return (
            <li
              key={step.n}
              className="flex gap-3 mb-5 last:mb-0 relative"
              style={{ opacity: step.dimmed ? 0.45 : 1 }}
            >
              {/* dot */}
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold z-10"
                style={dotStyle[dotVariant]}
              >
                {step.n}
              </div>

              {/* content */}
              <div className="flex-1 pt-0.5">
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {step.heading}
                </p>
                {step.detail && (
                  <p
                    className="text-xs leading-relaxed mb-1.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {step.detail}
                  </p>
                )}
                {step.code && (
                  <code
                    className="block text-[10px] rounded px-2 py-1 break-all"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      border: "1px solid",
                      color: step.codeColor ?? "var(--color-text-secondary)",
                    }}
                  >
                    {step.code}
                  </code>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && bun run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/admin/\(protected\)/github/setup-guide.tsx
git commit -m "feat(web): add SetupGuide timeline component for GitHub App setup"
```

---

### Task 3: Refactor the GitHub page into a two-column layout

**Files:**
- Modify: `apps/web/app/admin/(protected)/github/page.tsx`

- [ ] **Step 1: Add the `NEXTAUTH_URL` read and import `SetupGuide`**

Replace the top of `page.tsx` (lines 1–2):

```tsx
import { db, githubAppConfig } from "@trst/db";
import { GitHubAppForm } from "./form";
import { SetupGuide } from "./setup-guide";
```

- [ ] **Step 2: Read `NEXTAUTH_URL` in the page function body**

Inside `GitHubPage`, after the `const params = await searchParams;` and `const [config] = ...` lines, add:

```tsx
const baseUrl = process.env.NEXTAUTH_URL ?? "";
```

- [ ] **Step 3: Restructure the JSX to a two-column grid**

Replace the entire `return (...)` block with:

```tsx
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
```

- [ ] **Step 4: Typecheck**

```bash
cd apps/web && bun run typecheck
```

Expected: no errors.

- [ ] **Step 5: Start dev server and verify visually**

```bash
cd apps/web && bun run dev
```

Open `http://localhost:3000/admin/github`. Verify:
- Two columns render side by side (form left, guide right)
- URLs in steps 2 and 3 show `http://localhost:3000/api/github/install` and `http://localhost:3000/api/auth/callback/github`
- Step 6 (Install) is visually dimmed
- Guide stays sticky when scrolling the form

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/admin/\(protected\)/github/page.tsx
git commit -m "feat(web): two-column GitHub App setup page with env-filled guide URLs"
```
