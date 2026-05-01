# Build context: repo root (needed for workspace packages)
FROM oven/bun:1.2-slim

WORKDIR /app

# Layer 1: manifests (invalidated only when deps change)
COPY package.json bun.lock ./
COPY packages/db/package.json      ./packages/db/
COPY packages/shared/package.json  ./packages/shared/
COPY packages/core/package.json    ./packages/core/
COPY packages/ui/package.json      ./packages/ui/
COPY apps/agent/package.json       ./apps/agent/

RUN bun install --frozen-lockfile

# Layer 2: source (invalidated when code changes)
COPY packages/db/src       ./packages/db/src
COPY packages/shared/src   ./packages/shared/src
COPY apps/agent/src        ./apps/agent/src

WORKDIR /app/apps/agent

EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
