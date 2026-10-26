import { CatalogsController } from './clients/catalogs.controller.js';
import { ClientsController } from './clients/clients.controller.js';
import { CommercialController } from './commercial/interfaces/http/commercial.controller.js';
import { DashboardController } from './dashboard/dashboard.controller.js';
import { FollowUpsController } from './follow-ups/interfaces/http/follow-ups.controller.js';
import { AuthGuard } from './auth/presentation/auth.guard.js';
import { ROLES_KEY } from './auth/presentation/roles.decorator.js';
import { RolesGuard } from './auth/presentation/roles.guard.js';
import { ReportsController } from './reports/reports.controller.js';
import { VisitTrackingController } from './reports/visit-tracking.controller.js';
import { VisitTrackingCsvController } from './reports/visit-tracking-csv.controller.js';
import { RoutesController } from './routes/routes.controller.js';
import { StorageController } from './storage/interfaces/http/storage.controller.js';
import { VisitsController } from './visits/interfaces/http/visits.controller.js';

// HU-10: every controller must be protected by default. These tests read the
// real Nest metadata, so they fail if someone removes @Auth() or @UseGuards.
type Handler = (...args: unknown[]) => unknown;

const rolesOf = (target: object) =>
  Reflect.getMetadata(ROLES_KEY, target) as string[] | undefined;
const guardsOf = (target: object) =>
  (Reflect.getMetadata('__guards__', target) ?? []) as unknown[];

/** Route handlers of a controller: prototype methods carrying an HTTP verb. */
const handlersOf = (controller: { prototype: object }) =>
  Object.getOwnPropertyNames(controller.prototype)
    .filter((name) => name !== 'constructor')
    .map((name) => ({
      name,
      handler: (controller.prototype as Record<string, Handler>)[name],
    }))
    .filter(
      ({ handler }) =>
        typeof handler === 'function' &&
        Reflect.getMetadata('method', handler) !== undefined,
    );

/** Roles that apply to a handler: its own, else the controller's. */
const effectiveRoles = (controller: object, handler: Handler) =>
  rolesOf(handler) ?? rolesOf(controller);

const isGuarded = (controller: object, handler: Handler) => {
  const guards = [...guardsOf(controller), ...guardsOf(handler)];
  return guards.includes(AuthGuard) && guards.includes(RolesGuard);
};

// RequestMethod enum values from @nestjs/common: GET = 0.
const isRead = (handler: Handler) =>
  Reflect.getMetadata('method', handler) === 0;

describe('HU-10: controller protection', () => {
  it.each([
    ['clients', ClientsController],
    ['routes', RoutesController],
  ])('%s: every write endpoint is DIRECTOR-only', (_name, controller) => {
    const writes = handlersOf(controller).filter(
      ({ handler }) => !isRead(handler),
    );
    expect(writes.length).toBeGreaterThan(0);
    for (const { name, handler } of writes) {
      expect([name, effectiveRoles(controller, handler)]).toEqual([
        name,
        ['DIRECTOR'],
      ]);
    }
  });

  it.each([
    ['visits', VisitsController],
    ['commercial', CommercialController],
    ['follow-ups', FollowUpsController],
    ['storage', StorageController],
    ['reports', ReportsController],
  ])('%s requires a session (advisor and director)', (_name, controller) => {
    expect(rolesOf(controller)).toEqual([]);
  });

  it.each([
    ClientsController,
    CatalogsController,
    RoutesController,
    VisitsController,
    CommercialController,
    FollowUpsController,
    StorageController,
    ReportsController,
    DashboardController,
    VisitTrackingController,
    VisitTrackingCsvController,
  ])(
    '%o protects every endpoint with AuthGuard and RolesGuard',
    (controller) => {
      for (const { name, handler } of handlersOf(controller)) {
        expect([name, isGuarded(controller, handler)]).toEqual([name, true]);
      }
    },
  );
});
