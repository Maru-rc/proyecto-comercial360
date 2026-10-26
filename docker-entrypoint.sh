#!/bin/sh
# Backend entrypoint: optional migrations and director bootstrap, then the app.
# Usage: docker-entrypoint.sh [start|migrate|bootstrap|set-password|<command>]
set -e

DATA_SOURCE="dist/core/infrastructure/database/data-source.js"

run_migrations() {
  echo "[entrypoint] Running TypeORM migrations..."
  node node_modules/typeorm/cli.js migration:run -d "$DATA_SOURCE"
}

run_bootstrap() {
  echo "[entrypoint] Bootstrapping catalogs and the first director..."
  node dist/core/infrastructure/database/seeds/bootstrap-director.js
}

# Sets a user's password, or creates the user (USER_EMAIL, USER_PASSWORD, ...)
set_password() {
  node dist/core/infrastructure/database/seeds/set-user-password.js
}

start_app() {
  [ "${RUN_MIGRATIONS:-false}" = "true" ] && run_migrations
  [ "${RUN_BOOTSTRAP:-false}" = "true" ] && run_bootstrap
  echo "[entrypoint] Starting application..."
  exec node dist/main.js
}

COMMAND="${1:-start}"

case "$COMMAND" in
  start)     start_app ;;
  migrate)   run_migrations ;;
  bootstrap) run_bootstrap ;;
  set-password) set_password ;;
  *)         exec "$@" ;;
esac
