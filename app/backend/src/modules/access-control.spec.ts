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

const rolesOf = (controller: object) =>
  Reflect.getMetadata(ROLES_KEY, controller) as string[] | undefined;
const guardsOf = (controller: object) =>
  (Reflect.getMetadata('__guards__', controller) ?? []) as unknown[];

describe('HU-10: controller protection', () => {
  it.each([
    ['clients', ClientsController],
    ['routes', RoutesController],
  ])('%s is DIRECTOR-only', (_name, controller) => {
    expect(rolesOf(controller)).toEqual(['DIRECTOR']);
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
    RoutesController,
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
