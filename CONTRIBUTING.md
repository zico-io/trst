# Contributing

## Commit format

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Commits that land on `main` drive the automated changelog and version bumps.

```
<type>(<optional scope>): <subject>
```

**Allowed types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Dependency bumps, config, tooling |
| `docs` | Documentation only |
| `refactor` | Code change with no behavior change |
| `test` | Adding or fixing tests |
| `ci` | CI/CD workflow changes |
| `infra` | OpenTofu / infrastructure changes |

**Rules:**
- Subject is lowercase, no trailing period
- Scope is optional: `feat(agent): ...`, `fix(db): ...`
- Use `!` for breaking changes: `feat!: rename audit endpoint`

**Examples:**
```
feat: add SOC 2 control catalog
fix: resolve audit run race condition
chore: bump drizzle-orm to 0.41
docs: update README quick start
ci: add release-please workflow
infra: add Postgres backup module
```

Commits are enforced locally via [lefthook](https://github.com/evilmartians/lefthook) + [commitlint](https://commitlint.js.org/). Run `bun install` to install the git hook automatically.

## Branch naming

```
feat/<short-description>
fix/<short-description>
chore/<short-description>
```

## PR process

1. Open a PR against `main`
2. Fill out the PR template (summary, test plan, breaking changes)
3. Ensure CI passes (lint, typecheck, build)
4. Request review

## Release process

Releases are fully automated via [release-please](https://github.com/googleapis/release-please):

1. Commits land on `main` → release-please opens/updates a Release PR with the version bump and changelog
2. When ready to ship, merge the Release PR → release-please creates a GitHub Release and `vX.Y.Z` tag
3. Vercel picks up the tag for production deploys (configure in Vercel settings)

The project stays in `0.x` until a deliberate `1.0.0` is cut.
