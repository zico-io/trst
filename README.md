# trst

Bask Health's compliance monorepo — a public trust center and an agentic compliance framework.

| App | What it does | URL |
|-----|-------------|-----|
| `apps/web` | Next.js trust center — live compliance scores, policies, certifications | Vercel |
| `apps/agent` | Bun compliance agent — audits repos, creates issues, feeds the trust center | Cloud |

## Prerequisites

- [Bun](https://bun.sh) 1.2+
- [OpenTofu](https://opentofu.org) 1.8+ (for infra only)
- Postgres (for agent + db package)

## Quick start

```bash
bun install
bun dev          # runs both apps in parallel
```

| Command | What runs |
|---------|-----------|
| `bun dev` | trust center (port 3000) + agent (port 3001) |
| `bun run dev:web` | trust center only |
| `bun run dev:agent` | agent only |
| `bun run build` | production build |
| `bun run typecheck` | TypeScript across all packages |
| `bun run lint` | Biome lint across all packages |
| `bun run format` | Biome format (writes) |

## Environment variables

Copy `.env.example` (in `apps/agent/`) and fill in:

```bash
DATABASE_URL=postgres://...
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
LINEAR_API_KEY=lin_api_...
REVALIDATE_SECRET=<shared with trust center>
```

For the trust center set `REVALIDATE_SECRET` in Vercel env vars.

## Structure

```
apps/
  web/      Next.js trust center (Tailwind v4, MDX, ISR)
  agent/    Bun compliance agent (auditors, Claude gap mapper, Linear/GitHub)
packages/
  shared/   TypeScript types shared across apps
  core/     Framework catalogs (HIPAA, SOC 2, GDPR, ISO 27001, HITRUST) + scoring engine
  db/       Drizzle ORM schema + migrations (Postgres)
infra/      OpenTofu modules — networking, compute, data, secrets
```

## Database

```bash
cd packages/db
bun run generate   # generate migration from schema changes
bun run migrate    # apply migrations (requires DATABASE_URL)
```

## Compliance frameworks

| Framework | Status |
|-----------|--------|
| HIPAA | In progress |
| SOC 2 Type II | In progress |
| GDPR | In progress |
| ISO 27001 | In progress |
| HITRUST | In progress |
