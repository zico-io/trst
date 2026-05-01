#!/usr/bin/env bash
# Starts the full observe stack (ClickHouse + HyperDX + OTEL collector),
# fetches the HyperDX ingest key, then runs turbo dev with telemetry wired up.
set -euo pipefail

echo "[dev:observe] Starting ClickStack containers..."
docker-compose --profile observe up -d --wait

echo "[dev:observe] Registering HyperDX dev account (409 = already exists, fine)..."
curl -sf -X POST http://localhost:8000/register/password \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@trst.local","password":"Devpassword1!","confirmPassword":"Devpassword1!"}' \
  -o /dev/null || true

echo "[dev:observe] Fetching HyperDX ingest key..."
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT

curl -sf -c "$JAR" -X POST http://localhost:8000/login/password \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@trst.local","password":"Devpassword1!"}' \
  -o /dev/null

HDX_KEY=$(curl -sf -b "$JAR" http://localhost:8000/team \
  | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>process.stdout.write(JSON.parse(d).apiKey))")

echo "[dev:observe] Got key: ${HDX_KEY:0:8}..."

# Keep .env files in sync so `bun run --hot` direct runs also get auth.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

for ENV_FILE in \
  "$REPO_ROOT/apps/agent/.env" \
  "$REPO_ROOT/apps/web/.env.local"; do
  if [ -f "$ENV_FILE" ]; then
    if grep -q "^OTEL_EXPORTER_OTLP_HEADERS=" "$ENV_FILE"; then
      sed -i'' -e "s|^OTEL_EXPORTER_OTLP_HEADERS=.*|OTEL_EXPORTER_OTLP_HEADERS=authorization=${HDX_KEY}|" "$ENV_FILE"
    else
      echo "OTEL_EXPORTER_OTLP_HEADERS=authorization=${HDX_KEY}" >> "$ENV_FILE"
    fi
    echo "[dev:observe] Updated OTEL_EXPORTER_OTLP_HEADERS in ${ENV_FILE##*/}"
  fi
done

echo "[dev:observe] Running database migrations..."
bun run db:migrate

echo "[dev:observe] Starting dev servers with OTEL_EXPORTER_OTLP_HEADERS set..."
exec env \
  COMPOSE_PROFILES=observe \
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
  OTEL_EXPORTER_OTLP_HEADERS="authorization=${HDX_KEY}" \
  turbo dev
