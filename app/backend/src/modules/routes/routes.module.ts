import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteOrmEntity } from './infrastructure/persistence/entities/route.orm-entity.js';
import { RouteStopOrmEntity } from './infrastructure/persistence/entities/route-stop.orm-entity.js';
import { ROUTE_REPOSITORY } from './application/ports/route.repository.port.js';
import { ROUTES_ADVISOR_SCOPE } from './application/ports/advisor-scope-resolver.port.js';
import { ROUTE_VISIT_GENERATOR } from './application/ports/route-visit-generator.port.js';
import { ROUTE_READER, ADVISOR_READER } from '../../domain-contracts/index.js';
import { TypeOrmRouteRepository } from './infrastructure/persistence/typeorm-route.repository.js';
import { TypeOrmRouteVisitGeneratorAdapter } from './infrastructure/adapters/typeorm-route-visit-generator.adapter.js';
import { TypeOrmAdvisorLookupAdapter } from './infrastructure/adapters/typeorm-advisor-lookup.adapter.js';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case.js';
import { ListRoutesUseCase } from './application/use-cases/list-routes.use-case.js';
import { SetRouteStopsUseCase } from './application/use-cases/set-route-stops.use-case.js';
import { GetRouteByIdUseCase } from './application/use-cases/get-route-by-id.use-case.js';
import { AssignRouteUseCase } from './application/use-cases/assign-route.use-case.js';
import { RoutesController } from './routes.controller.js';
import { AdvisorsController } from './presentation/advisors.controller.js';
import { ClientsModule } from '../clients/clients.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteOrmEntity, RouteStopOrmEntity]),
    ClientsModule,
    AuthModule,
  ],
  controllers: [RoutesController, AdvisorsController],
  providers: [
    CreateRouteUseCase,
    ListRoutesUseCase,
    SetRouteStopsUseCase,
    GetRouteByIdUseCase,
    AssignRouteUseCase,
    TypeOrmRouteRepository,
    TypeOrmRouteVisitGeneratorAdapter,
    TypeOrmAdvisorLookupAdapter,
    {
      provide: ROUTES_ADVISOR_SCOPE,
      useFactory: (resolver: unknown) => resolver,
      inject: ['ResolveAdvisorScopeUseCase'],
    },
    {
      provide: ROUTE_REPOSITORY,
      useExisting: TypeOrmRouteRepository,
    },
    {
      provide: ROUTE_READER,
      useExisting: TypeOrmRouteRepository,
    },
    {
      provide: ROUTE_VISIT_GENERATOR,
      useExisting: TypeOrmRouteVisitGeneratorAdapter,
    },
    {
      provide: ADVISOR_READER,
      useExisting: TypeOrmAdvisorLookupAdapter,
    },
  ],
  exports: [
    ROUTE_READER,
    ROUTE_REPOSITORY,
    ADVISOR_READER,
    CreateRouteUseCase,
    SetRouteStopsUseCase,
    GetRouteByIdUseCase,
    AssignRouteUseCase,
  ],
})
export class RoutesModule {}
