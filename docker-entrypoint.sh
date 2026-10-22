#!/bin/sh
# Backend entrypoint: waits for PostgreSQL, optionally runs migrations/seeds, then starts the app.
# Usage: docker-entrypoint.sh [start|migrate|seed]
set -e

DB_PORT="${DB_PORT:-5432}"
APP_ENV="${APP_ENV:-production}"
: "${DB_HOST:?DB_HOST is required}"

wait_for_db() {
  echo "[entrypoint] Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
  retries=30
  until nc -z "$DB_HOST" "$DB_PORT"; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      echo "[entrypoint] ERROR: database is not reachable" >&2
      exit 1
    fi
    sleep 2
  done
  echo "[entrypoint] Database is reachable."
}

run_migrations() {
  echo "[entrypoint] Running TypeORM migrations..."
  if [ "$APP_ENV" = "development" ]; then
    npm run migration:run
  else
    npx typeorm migration:run -d dist/database/data-source.js
  fi
}

run_seed() {
  echo "[entrypoint] Running seeds..."
  if [ "$APP_ENV" = "development" ]; then
    npm run seed
  else
    node dist/database/seeds/run-seed.js
  fi
}

start_app() {
  [ "${RUN_MIGRATIONS:-false}" = "true" ] && run_migrations
  [ "${RUN_SEED:-false}" = "true" ] && run_seed
  echo "[entrypoint] Starting application (${APP_ENV})..."
  if [ "$APP_ENV" = "development" ]; then
    exec npm run start:dev
  else
    exec node dist/main.js
  fi
}

COMMAND="${1:-start}"

case "$COMMAND" in
  start)   wait_for_db; start_app ;;
  migrate) wait_for_db; run_migrations ;;
  seed)    wait_for_db; run_seed ;;
  *)       exec "$@" ;;
esac
