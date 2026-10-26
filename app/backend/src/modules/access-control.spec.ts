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
import { AdvisorsController } from './routes/presentation/advisors.controller.js';
import { RoutesController } from './routes/routes.controller.js';
import { StorageController } from './storage/interfaces/http/storage.controller.js';
import { VisitsController } from './visits/interfaces/http/visits.controller.js';

// HU-10: every controller must be protected by default. These tests read the
// real class metadata, so they fail if someone removes @Auth() or @UseGuards.
const rolesOf = (controller: object) =>
  Reflect.getMetadata(ROLES_KEY, controller) as string[] | undefined;
const guardsOf = (controller: object) =>
  (Reflect.getMetadata('__guards__', controller) ?? []) as unknown[];

// Clients and routes are protected per endpoint, not per class: advisors need
// to read clients (Visitas page) while only the director creates or assigns.
type Controller = { name: string; prototype: object };
const endpoint = (controller: Controller, method: string) => ({
  label: `${controller.name}.${method}`,
  handler: (controller.prototype as Record<string, object>)[method],
});
const endpointsOf = (controller: Controller) =>
  Object.getOwnPropertyNames(controller.prototype)
    .filter((method) => method !== 'constructor')
    .map((method) => endpoint(controller, method));

describe('HU-10: endpoint protection in clients and routes', () => {
  it.each([
    endpoint(ClientsController, 'create'),
    endpoint(ClientsController, 'importar'),
    endpoint(RoutesController, 'create'),
    endpoint(RoutesController, 'setClients'),
    endpoint(RoutesController, 'setStops'),
    endpoint(RoutesController, 'assignRoute'),
  ])('$label is DIRECTOR-only', ({ handler }) => {
    expect(rolesOf(handler)).toEqual(['DIRECTOR']);
  });

  it.each([
    endpoint(ClientsController, 'getCatalogos'),
    endpoint(ClientsController, 'getPlantilla'),
    endpoint(ClientsController, 'list'),
    endpoint(ClientsController, 'getHistorial'),
    endpoint(ClientsController, 'getById'),
    endpoint(RoutesController, 'findAll'),
    endpoint(RoutesController, 'getAdvisors'),
    endpoint(RoutesController, 'getById'),
    endpoint(CatalogsController, 'getCatalogos'),
    endpoint(AdvisorsController, 'getActiveAdvisors'),
  ])('$label requires a session (advisor and director)', ({ handler }) => {
    expect(rolesOf(handler)).toEqual([]);
  });

  it.each([
    ...endpointsOf(ClientsController),
    ...endpointsOf(RoutesController),
    ...endpointsOf(CatalogsController),
    ...endpointsOf(AdvisorsController),
  ])('$label uses AuthGuard and RolesGuard', ({ handler }) => {
    const guards = guardsOf(handler);
    expect(guards).toContain(AuthGuard);
    expect(guards).toContain(RolesGuard);
  });
});

describe('HU-10: controller protection', () => {
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
    VisitsController,
    CommercialController,
    FollowUpsController,
    StorageController,
    ReportsController,
    DashboardController,
    VisitTrackingController,
    VisitTrackingCsvController,
  ])('%o uses AuthGuard and RolesGuard', (controller) => {
    const guards = guardsOf(controller);
    expect(guards).toContain(AuthGuard);
    expect(guards).toContain(RolesGuard);
  });
});
