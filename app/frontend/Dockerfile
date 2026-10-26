# syntax=docker/dockerfile:1
# Build context: repository root (pnpm workspace + pnpm-lock.yaml).
#   docker build -f app/frontend/Dockerfile .

FROM node:22-alpine AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY app/frontend/package.json app/frontend/package.json
RUN pnpm fetch --filter frontend...

COPY app/frontend app/frontend
# Leave VITE_API_URL empty in production: the SPA calls /api on its own origin,
# which keeps the Better Auth session cookie same-site.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm install --offline --frozen-lockfile --filter frontend... --ignore-scripts \
 && pnpm --filter frontend build

# ---------- Runtime ----------
FROM nginx:alpine AS production
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/app/frontend/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
