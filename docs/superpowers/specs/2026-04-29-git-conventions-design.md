# Git Conventions, release-please, and CI Design

_2026-04-29_

## Goal

Establish git commit conventions, automated changelog + release management, CI gating, and a PR template for the trst monorepo.

## Architecture

Conventional commits enforced locally via lefthook + commitlint. GitHub Actions runs CI on every push/PR and triggers release-please on merges to `main`. release-please operates in unified (single-package) mode — one `CHANGELOG.md` and one semver tag for the whole monorepo. PR template lives in `.github/pull_request_template.md`.

## Components

### 1. `.github/workflows/ci.yml`

Triggered on: `push` to `main`, `pull_request` targeting `main`.

Steps:
1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2` (Bun 1.2)
3. `bun install --frozen-lockfile`
4. `bun turbo lint typecheck build`

Fails fast on any step. Required status check — PRs cannot merge if CI is red.

### 2. `.github/workflows/release-please.yml`

Triggered on: `push` to `main`.

Uses `googleapis/release-please-action@v4` with:
- `release-type: node`
- `bump-minor-pre-major: true` (0.x stays minor bumps)

Behavior:
- After each merged commit, release-please opens/updates a "Release PR" with the version bump and aggregated `CHANGELOG.md` entries.
- Merging the Release PR creates a GitHub Release and a `vX.Y.Z` git tag.
- `package.json` at the root is bumped by release-please.

Requires a `GITHUB_TOKEN` secret (provided automatically by GitHub Actions).

### 3. `.github/pull_request_template.md`

Sections:
- **Summary** — 1-3 bullet points describing what changed and why
- **Test plan** — markdown checklist of what was tested
- **Breaking changes** — checkbox: "This PR contains breaking changes" (if checked, must describe impact)
- Footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)` (optional, remove if not applicable)

### 4. `lefthook.yml`

Hook: `commit-msg`
Command: `bunx commitlint --edit "$1"`

Runs commitlint against the commit message before it's saved. Fails the commit if the message doesn't conform.

Install step: `bunx lefthook install` (run once after `bun install`; can be added to a postinstall script).

### 5. `.commitlintrc.json`

Extends `@commitlint/config-conventional`.

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `infra`

Scope is optional. Subject must be lowercase, no trailing period.

Examples:
- `feat: add SOC 2 control catalog`
- `fix: resolve audit run race condition`
- `chore: bump drizzle-orm to 0.41`
- `ci: add release-please workflow`
- `infra: add Postgres backup module`

### 6. `CONTRIBUTING.md`

Contents:
- **Commit format** — conventional commits reference with examples
- **Branch naming** — `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- **PR process** — fill out PR template, ensure CI passes, request review
- **Release process** — merging to `main` triggers release-please; merging the Release PR cuts the release

## File Summary

| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | Create |
| `.github/workflows/release-please.yml` | Create |
| `.github/pull_request_template.md` | Create |
| `lefthook.yml` | Create |
| `.commitlintrc.json` | Create |
| `CONTRIBUTING.md` | Create |
| `package.json` | Modify — add `postinstall: lefthook install` script, add `@commitlint/cli`, `@commitlint/config-conventional`, `lefthook` to devDependencies |

## Versioning Strategy

Unified: single `CHANGELOG.md` at repo root, single `vX.Y.Z` tag per release. All packages and apps ship together. `bump-minor-pre-major: true` keeps the project in `0.x` minor bumps until a deliberate `1.0.0` is cut.

## Prerequisites

- Repo must be pushed to GitHub (no remote configured yet — this must happen before the GitHub Actions workflows can run).
- `GITHUB_TOKEN` is auto-provided by GitHub Actions; no manual secret setup needed for release-please.
