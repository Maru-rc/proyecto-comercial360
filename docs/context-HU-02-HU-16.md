# Context Document — HU-02 & HU-16
> **Purpose:** Give any AI assistant full context about the current state of these two stories so it can continue work without re-reading the entire codebase.
> **Developer:** Saúl Uribe (`@saul`) — Database & Analytics Specialist
> **Branch:** `feat/HU-02-migrations-and-seeds-typeorm`

---

## Repository Structure

```
proyecto-comercial360/
├── app/
│   └── backend/          ← NestJS backend (the real one — NOT /backend/)
│       ├── src/
│       │   ├── core/
│       │   │   └── infrastructure/database/
│       │   │       ├── data-source.ts        ← TypeORM CLI entry point
│       │   │       ├── migrations/           ← all migration files (000–007)
│       │   │       └── seeds/                ← run-seed.ts + seed-demo-users.ts
│       │   └── modules/
│       │       ├── auth/                     ← BetterAuth + guards + asesor
│       │       └── dashboard/                ← HU-16 KPI endpoint
│       └── package.json
├── pnpm-workspace.yaml
└── docs/
    └── context-HU-02-HU-16.md  ← this file
```

**Key facts:**
- TypeScript `"module": "nodenext"` (ESM) — all imports need `.js` extension
- TypeORM CLI uses `tsx` (not `ts-node`) because of ESM — already configured
- PostgreSQL runs locally at `127.0.0.1:5432`, database: `comercial360_db`
- pnpm workspace; run commands from `app/backend/` or use `--filter backend`

---

## HU-02 — Migrations and Seeds with TypeORM

### Story
> As a team we want tables and initial data created via TypeORM so we never create anything by hand and can spin up the database from zero in any environment.

### Acceptance Criteria
- One migration per logical group of tables. 25 tables total.
- `synchronize: false` in all environments — schema only changes via migrations.
- A seed command loads catalogs and 2 demo users (1 ASESOR + 1 DIRECTOR).
- Running `migration:run` + `seed` on an empty DB makes the app ready to use.

### What is DONE ✅

**Migrations (all applied, `[X]` in migration:show):**

| File | Tables Created |
|---|---|
| `1792500000000-CreateAsesorTable.ts` | `asesor` |
| `1792500000001-CreateBetterAuthTables.ts` | `user`, `session`, `account`, `verification` |
| `1792500000002-CreateCatalogTables.ts` | `zona`, `tipo_cliente`, `potencial`, `estado_cliente`, `portafolio`, `resultado_visita` |
| `1792500000003-CreateClientTables.ts` | `cliente`, `contacto_cliente`, `cliente_portafolio` |
| `1792500000004-CreateRouteTables.ts` | `ruta`, `ruta_cliente` |
| `1792500000005-CreateVisitTables.ts` | `visita`, `visita_resultado`, `seguimiento` |
| `1792500000006-CreateCommercialTables.ts` | `cotizacion`, `cotizacion_detalle`, `pedido` |
| `1792500000007-CreateSupportTables.ts` | `historial_cliente`, `adjunto` |

**TypeORM CLI scripts (in `package.json`):**
```json
"typeorm": "tsx ./node_modules/typeorm/cli.js",
"migration:run": "pnpm run typeorm migration:run -d src/core/infrastructure/database/data-source.ts",
"migration:show": "pnpm run typeorm migration:show -d src/core/infrastructure/database/data-source.ts"
```

**Auth module — fully implemented and translated to English:**
- `auth.factory.ts` — BetterAuth configured with pg.Pool, sessions, roles
- `pg-pool.ts` — PostgreSQL pool shared with TypeORM
- `AsesorOrmEntity` + `TypeOrmAsesorRepository` + `AsesorRepository` port
- `AuthGuard` — validates BetterAuth cookie session → puts user in `req.authUser`
- `RolesGuard` + `@Roles()` decorator
- `@Auth()` composite decorator (AuthGuard + RolesGuard + Swagger)
- `GetMeUseCase` → `GET /api/me`
- `ResolveAsesorScopeUseCase` — anti-IDOR: ASESOR always gets their own id from DB
- `DomainErrorsFilter` — converts domain errors to 403

### What is PENDING ⏳

**1. Seed files need to be fixed and translated to English**

`run-seed.ts` has `seedCatalogs()` inserting into wrong table names:

| Wrong name (in code) | Correct name (in DB) |
|---|---|
| `zones` | `zona` |
| `customer_types` | `tipo_cliente` |
| `potentials` | `potencial` |
| `customer_statuses` | `estado_cliente` |
| `visit_outcomes` | `resultado_visita` |
| `sort_order` column | `orden` column |

`seed-demo-users.ts` has comments in Spanish — needs translation.

**2. `domain-errors.filter.ts` still has Spanish JSDoc** — needs translation.

**3. After fixing seeds** → test with:
```bash
cd app/backend
pnpm seed
```

### Key Design Decisions
- `synchronize: false` everywhere — never auto-sync
- BetterAuth uses its own `pg.Pool` (same DB, separate connection pool)
- ASESOR users are linked to `user` table via `user.email = asesor.correo`
- Passwords are hashed by BetterAuth's internal scrypt hasher — never bcrypt manually
- Seeds are idempotent: `ON CONFLICT DO NOTHING`

---

## HU-16 — Weekly Commercial KPIs

### Story
> As an asesor or director I want to see the week's indicators to know how commercial management is going.

### Acceptance Criteria
- Filters: Territory (zona) and Week. Default: current week. ASESOR sees own data; DIRECTOR sees all.
- 6 KPI cards calculated as:
  - Scheduled visits: `COUNT` of `visita` with `fecha_programada` in the week
  - Completed visits: `COUNT` where `estado_visita = 'VISITADO'`
  - Effectiveness: `completed / scheduled × 100`
  - Quoted value: `SUM` of `cotizacion.valor` in the week
  - Closed orders: `COUNT` of `pedido` in the week
  - Route billing: `SUM` of `pedido.valor` in the week
- Weekly goal card: `% compliance`, progress bar, `"Target: X | Completed: Y"`
- Monetary values in Colombian pesos format (`$ 215.450.000`) — formatting is frontend's job
- Endpoint: `GET /dashboard/kpis?zona=&semana=`

### What is DONE ✅

**Files created (NOT yet committed):**

```
app/backend/src/modules/dashboard/
├── application/
│   ├── dtos/
│   │   ├── weekly-kpis-query.dto.ts      ← semana (YYYY-Www) + zona (optional)
│   │   └── weekly-kpis-response.dto.ts   ← 6 KPI cards + weeklyGoal
│   └── use-cases/
│       └── get-weekly-kpis.use-case.ts   ← single execute(user, dto) method
├── infrastructure/
│   └── dashboard.repository.ts           ← 4 parallel SQL queries, no N+1
├── dashboard.module.ts                   ← imports AuthModule
└── dashboard.controller.ts               ← GET /dashboard/kpis with AuthGuard
```

**Endpoint:**
```
GET /api/dashboard/kpis?semana=2026-W42&zona=1
Authorization: BetterAuth session cookie
```

**Response shape:**
```json
{
  "week": "2026-W42",
  "scheduledVisits": 12,
  "completedVisits": 9,
  "effectivenessRate": 75.0,
  "quotedValue": 215450000,
  "closedOrders": 4,
  "routeBilling": 98300000,
  "weeklyGoal": {
    "target": 12,
    "completed": 9,
    "percentage": 75.0
  }
}
```

**4 SQL queries run in parallel via `Promise.all`:**
1. Visit stats (scheduled + completed COUNT with optional asesor/zona filter)
2. Quoted value (SUM cotizacion.valor with optional asesor filter)
3. Order stats (COUNT + SUM pedido with optional asesor/zona filter)
4. Weekly target (COUNT active route stops for the asesor)

### What is PENDING ⏳

1. **Commit** — dashboard files are staged but not committed yet
2. **Test** — no test data in DB yet (seed needs to run first)
3. **Unit tests** — `get-weekly-kpis.use-case.spec.ts` not written yet (Manuel Rueda is assigned QA)

### Key Design Decisions
- `id_asesor` always comes from `ResolveAsesorScopeUseCase`, never from query string (anti-IDOR)
- `DataSource.query<T[]>()` returns `T[]` — access with `rows[0]`, not destructuring
- `RequestWithUser` imported with `import type` (required by `isolatedModules` + `emitDecoratorMetadata`)
- Monetary values returned as raw `number` — frontend formats as COP currency

---

## Pending Commits (in order)

```
1. chore(auth): translate remaining auth files to English
   Files: domain-errors.filter.ts + auth.guard.ts + roles.guard.ts +
          roles.decorator.ts + auth.module.ts + me.controller.ts +
          auth.decorator.ts + authenticated-user.ts + role.ts +
          asesor.repository.ts + typeorm-asesor.repository.ts +
          asesor.orm-entity.ts + pg-pool.ts + auth.factory.ts +
          1792500000001-CreateBetterAuthTables.ts

2. fix(seed): correct table names and translate to English
   Files: run-seed.ts, seed-demo-users.ts

3. feat(dashboard): add GET /dashboard/kpis endpoint (HU-16)
   Files: all dashboard/ new/modified files
```

---

## Commands Quick Reference

```bash
# From app/backend/

# Run all pending migrations
pnpm migration:run

# Check migration status
pnpm migration:show

# Run the seed (needs .env with SEED_ASESOR_PASSWORD + SEED_DIRECTOR_PASSWORD)
pnpm seed

# Build
pnpm build

# Run dev server
pnpm start:dev
```

## .env Required Variables (app/backend/.env)
```
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=comercial360_db
DATABASE_SSL=false
BETTER_AUTH_SECRET=<at least 32 chars>
BETTER_AUTH_URL=http://localhost:3001
SEED_ASESOR_PASSWORD=<any password>
SEED_DIRECTOR_PASSWORD=<any password>
```
