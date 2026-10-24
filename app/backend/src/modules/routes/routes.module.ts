import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteOrmEntity } from './infrastructure/persistence/entities/route.orm-entity.js';
import { RouteStopOrmEntity } from './infrastructure/persistence/entities/route-stop.orm-entity.js';
import { ROUTE_REPOSITORY } from './application/ports/route.repository.port.js';
import { ROUTE_READER } from '../../domain-contracts/index.js';
import { TypeOrmRouteRepository } from './infrastructure/persistence/typeorm-route.repository.js';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case.js';
import { SetRouteStopsUseCase } from './application/use-cases/set-route-stops.use-case.js';
import { GetRouteByIdUseCase } from './application/use-cases/get-route-by-id.use-case.js';
import { RoutesController } from './routes.controller.js';
import { ClientsModule } from '../clients/clients.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteOrmEntity, RouteStopOrmEntity]),
    ClientsModule,
  ],
  controllers: [RoutesController],
  providers: [
    CreateRouteUseCase,
    SetRouteStopsUseCase,
    GetRouteByIdUseCase,
    TypeOrmRouteRepository,
    {
      provide: ROUTE_REPOSITORY,
      useExisting: TypeOrmRouteRepository,
    },
    {
      provide: ROUTE_READER,
      useExisting: TypeOrmRouteRepository,
    },
  ],
  exports: [
    ROUTE_READER,
    ROUTE_REPOSITORY,
    CreateRouteUseCase,
    SetRouteStopsUseCase,
    GetRouteByIdUseCase,
  ],
})
export class RoutesModule {}
