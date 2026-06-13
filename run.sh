#!/usr/bin/env bash
# Start the SGIPC 2.0 stack (backend API + queue worker via Docker, frontend via npm).
#
# Usage:
#   ./run.sh           # frontend in dev mode (hot reload)
#   ./run.sh prod      # frontend in production mode (uses last `next build`)
#   ./run.sh stop      # stop everything
#   ./run.sh logs      # tail backend container logs

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
MODE="${1:-dev}"

API_NAME="sgipc-api"
QUEUE_NAME="sgipc-queue"
IMAGE="sgipc-cli"

# ──────────────────────────── stop ────────────────────────────
stop_all() {
  echo "stopping containers..."
  docker rm -f "$API_NAME" "$QUEUE_NAME" >/dev/null 2>&1 || true
  echo "stopping next.js..."
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "next dev"    2>/dev/null || true
  pkill -f "next start"  2>/dev/null || true
  echo "stopped."
}

if [ "$MODE" = "stop" ]; then
  stop_all
  exit 0
fi

if [ "$MODE" = "logs" ]; then
  exec docker logs -f "$API_NAME"
fi

# ──────────────────────────── preflight ────────────────────────────
command -v docker >/dev/null || { echo "docker not installed"; exit 1; }
command -v npm    >/dev/null || { echo "npm not installed";    exit 1; }
docker image inspect "$IMAGE" >/dev/null 2>&1 || {
  echo "docker image '$IMAGE' missing. build it with:"
  echo "  cd $BACKEND && docker build -t $IMAGE .docker"
  exit 1
}
[ -f "$BACKEND/.env" ]          || { echo "missing $BACKEND/.env";          exit 1; }
[ -f "$FRONTEND/.env.local" ]   || { echo "missing $FRONTEND/.env.local";   exit 1; }
[ -d "$FRONTEND/node_modules" ] || { echo "run 'npm install' in $FRONTEND first"; exit 1; }

# ──────────────────────────── cleanup ────────────────────────────
docker rm -f "$API_NAME" "$QUEUE_NAME" >/dev/null 2>&1 || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "next dev"    2>/dev/null || true
pkill -f "next start"  2>/dev/null || true

cleanup() {
  echo
  echo "shutting down..."
  docker rm -f "$API_NAME" "$QUEUE_NAME" >/dev/null 2>&1 || true
  [ -n "${FRONT_PID:-}" ] && kill "$FRONT_PID" 2>/dev/null || true
  pkill -f "next-server" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ──────────────────────────── backend ────────────────────────────
echo "starting backend API on :8000..."
docker run -d --rm --name "$API_NAME" \
  -u "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$BACKEND":/app -w /app --network host \
  "$IMAGE" php artisan serve --host=0.0.0.0 --port=8000 >/dev/null

echo "starting queue worker..."
docker run -d --rm --name "$QUEUE_NAME" \
  -u "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$BACKEND":/app -w /app --network host \
  "$IMAGE" php artisan queue:work --tries=3 --sleep=3 >/dev/null

# Wait until the API is actually accepting connections
for _ in $(seq 1 20); do
  if curl -sf http://localhost:8000/up >/dev/null 2>&1; then break; fi
  sleep 0.5
done

# ──────────────────────────── frontend ────────────────────────────
cd "$FRONTEND"
if [ "$MODE" = "prod" ] || [ "$MODE" = "start" ]; then
  [ -d ".next" ] || { echo "no production build found; run 'npx next build --no-lint' first"; exit 1; }
  echo "starting frontend (production) on :3000..."
  npm run start &
else
  echo "starting frontend (dev) on :3000..."
  npm run dev &
fi
FRONT_PID=$!

echo
echo "──────────────────────────────────────────────"
echo "  frontend → http://localhost:3000"
echo "  backend  → http://localhost:8000"
echo "  ctrl-c here to stop everything"
echo "──────────────────────────────────────────────"
wait "$FRONT_PID"
