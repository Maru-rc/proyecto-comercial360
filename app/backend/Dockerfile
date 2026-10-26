# syntax=docker/dockerfile:1
# Build context: repository root (pnpm workspace + pnpm-lock.yaml).
#   docker build -f app/backend/Dockerfile .

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable

# ---------- Build ----------
FROM base AS build
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY app/backend/package.json app/backend/package.json
# Paquetes en una caché de BuildKit: un cambio del lockfile no los vuelve a bajar todos
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch --filter backend...

COPY app/backend app/backend
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prefer-offline --frozen-lockfile --filter backend... --ignore-scripts \
 && pnpm --filter backend build \
 && pnpm --filter backend deploy --prod --legacy /out \
 && cp -r app/backend/dist /out/dist

# Amazon RDS CA bundle, used when DATABASE_SSL_CA points to it
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /out/certs/rds-global-bundle.pem

# ---------- Runtime ----------
FROM node:22-alpine AS production
ENV NODE_ENV=production PORT=3000
WORKDIR /usr/src/app

COPY --from=build --chown=node:node /out ./
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 0755 /usr/local/bin/docker-entrypoint.sh \
 && chmod 0644 certs/rds-global-bundle.pem

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["start"]
