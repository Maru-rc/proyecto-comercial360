import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';

import { CustomerOrmEntity } from './infrastructure/persistence/entities/customer.orm-entity.js';
import { CustomerContactOrmEntity } from './infrastructure/persistence/entities/customer-contact.orm-entity.js';
import { CustomerPortfolioOrmEntity } from './infrastructure/persistence/entities/customer-portfolio.orm-entity.js';
import { CustomerHistoryOrmEntity } from './infrastructure/persistence/entities/customer-history.orm-entity.js';
import { ZoneOrmEntity } from './infrastructure/persistence/entities/zone.orm-entity.js';
import { CustomerTypeOrmEntity } from './infrastructure/persistence/entities/customer-type.orm-entity.js';
import { PotentialOrmEntity } from './infrastructure/persistence/entities/potential.orm-entity.js';
import { CustomerStatusOrmEntity } from './infrastructure/persistence/entities/customer-status.orm-entity.js';
import { PortfolioOrmEntity } from './infrastructure/persistence/entities/portfolio.orm-entity.js';
import { AttachmentOrmEntity } from './infrastructure/persistence/entities/attachment.orm-entity.js';

import { CLIENT_REPOSITORY } from './application/ports/client.repository.port.js';
import { CATALOG_REPOSITORY } from './application/ports/catalog.repository.port.js';
import { GEOCODING_SERVICE } from './application/ports/geocoding.port.js';
import { CLIENT_READER } from '../../domain-contracts/index.js';
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm-client.repository.js';
import { TypeOrmCatalogRepository } from './infrastructure/persistence/typeorm-catalog.repository.js';
import { NominatimGeocodingAdapter } from './infrastructure/geocoding/nominatim-geocoding.adapter.js';

import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';
import { GetClientByIdUseCase } from './application/use-cases/get-client-by-id.use-case.js';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case.js';

import { ClientsController } from './clients.controller.js';
import { CatalogsController } from './catalogs.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerOrmEntity,
      CustomerContactOrmEntity,
      CustomerPortfolioOrmEntity,
      CustomerHistoryOrmEntity,
      ZoneOrmEntity,
      CustomerTypeOrmEntity,
      PotentialOrmEntity,
      CustomerStatusOrmEntity,
      PortfolioOrmEntity,
      AttachmentOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [ClientsController, CatalogsController],
  providers: [
    CreateClientUseCase,
    ListClientsUseCase,
    GetClientByIdUseCase,
    GetCatalogsUseCase,
    TypeOrmClientRepository,
    TypeOrmCatalogRepository,
    NominatimGeocodingAdapter,
    {
      provide: CLIENT_REPOSITORY,
      useExisting: TypeOrmClientRepository,
    },
    {
      provide: CLIENT_READER,
      useExisting: TypeOrmClientRepository,
    },
    {
      provide: CATALOG_REPOSITORY,
      useExisting: TypeOrmCatalogRepository,
    },
    {
      provide: GEOCODING_SERVICE,
      useExisting: NominatimGeocodingAdapter,
    },
  ],
  exports: [
    CLIENT_READER,
    CLIENT_REPOSITORY,
    CreateClientUseCase,
    ListClientsUseCase,
    GetClientByIdUseCase,
  ],
})
export class ClientsModule {}
