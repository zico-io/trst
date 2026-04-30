# GitHub App Setup — Two-Column Layout

**Date:** 2026-04-30  
**Status:** Approved  
**Scope:** `apps/web/app/admin/(protected)/github/`

---

## Overview

Improve the `/admin/github` page by adding a right-hand **Setup Guide** column that walks the user through creating and configuring a GitHub App step by step. Real callback and setup URLs are filled in from `process.env.NEXTAUTH_URL` server-side, so the user can copy-paste them directly without guessing.

---

## Layout

**Two-column grid** inside a widened container:

- **Left column (form):** existing credentials card — App ID, App Slug, Private Key, Client ID, Client Secret, Webhook Secret, Save + Install buttons.
- **Right column (guide):** 340px wide, `position: sticky; top: 2rem` so it stays visible while the form scrolls.
- **Container width:** `max-w-3xl` in the shared layout (`apps/web/app/admin/(protected)/layout.tsx`) widens to `max-w-5xl` to accommodate both columns.

---

## Setup Guide — Content & Steps

The guide renders a **timeline** (vertical line, numbered dot per step). Steps are static reference — no interactivity, no checkboxes.

| # | Heading | Detail |
|---|---------|--------|
| 1 | Create a GitHub App | Link to `github.com/settings/apps/new` |
| 2 | Set the Setup URL | `{NEXTAUTH_URL}/api/github/install` — rendered from env |
| 3 | Set OAuth Callback URL | `{NEXTAUTH_URL}/api/auth/callback/github` — rendered from env |
| 4 | Enable repository permissions | Contents: Read-only · Issues: Read & write · Metadata: Read-only |
| 5 | Download private key & copy credentials | Prose instruction pointing to the form fields |
| 6 | Install the app | Dimmed — note that the Install button appears after saving credentials |

**Dot colours:** step 1 = green (entry point), steps 2–5 = blue (action), step 6 = muted/greyed (locked until credentials saved).

---

## Data Flow

`page.tsx` (Server Component) already reads from the DB. It additionally reads:

```ts
const baseUrl = process.env.NEXTAUTH_URL ?? "";
```

This value is passed as a prop to a new `<SetupGuide baseUrl={baseUrl} />` component. No client-side JS needed for the guide.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/app/admin/(protected)/layout.tsx` | `max-w-3xl` → `max-w-5xl` |
| `apps/web/app/admin/(protected)/github/page.tsx` | Read `NEXTAUTH_URL`, restructure JSX into two-column grid, render `<SetupGuide>` |
| `apps/web/app/admin/(protected)/github/setup-guide.tsx` | New file — timeline component, receives `baseUrl: string` prop |

---

## Design Decisions

- **Static guide, not interactive:** Keeps the component a simple Server Component with no state. The form already provides feedback (✓ set badges, Install button unlock) — duplicating that in the guide adds complexity with little gain.
- **Right column for guide:** Form is the primary action; guide is reference. Placing the action first (left) is more natural for returning users who already know the steps.
- **Container widened in layout:** Simpler than a per-page override. Other admin pages (LLM, Repos) benefit from the extra breathing room — none have content wide enough to look sprawling at 5xl.
- **`NEXTAUTH_URL` not `VERCEL_URL`:** `NEXTAUTH_URL` is already the canonical base URL across environments (local + production) in this project; `VERCEL_URL` is not set locally and is missing the protocol prefix.

---

## Out of Scope

- Webhook URL step — the agent's webhook endpoint is on a separate service (`AGENT_URL`), not the web app. Adding it would require passing a second env var and adds confusion for the current single-tenant setup.
- Interactive step completion — deferred; static reference is sufficient.
- Copy-to-clipboard buttons on URL code blocks — nice to have, not in this spec.
