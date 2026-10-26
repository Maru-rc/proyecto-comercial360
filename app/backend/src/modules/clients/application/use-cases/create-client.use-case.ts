import { Inject, Injectable } from '@nestjs/common';
import { Nit } from '../../domain/value-objects/nit.vo.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import { ClienteYaExisteError } from '../../domain/client.errors.js';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientSummaryRecord,
} from '../ports/client.repository.port.js';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../ports/catalog.repository.port.js';
import {
  GEOCODING_SERVICE,
  type GeocodingService,
} from '../ports/geocoding.port.js';
import {
  buildClientAggregate,
  type ClientFormCommand,
} from '../services/client-aggregate.builder.js';

export type CreateClientCommand = ClientFormCommand;

export interface UserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepo: CatalogRepository,
    @Inject(GEOCODING_SERVICE)
    private readonly geocodingService: GeocodingService,
  ) {}

  async execute(
    command: CreateClientCommand,
    currentUser?: UserContext,
  ): Promise<ClientSummaryRecord> {
    // 1. Validar unicidad del NIT
    const nitVO = new Nit(command.nit);
    const existing = await this.clientRepo.findByTaxId(nitVO.value);
    if (existing) {
      throw new ClienteYaExisteError(nitVO.value);
    }

    // 2. Catálogos, portafolios, coordenadas y entidades de dominio
    const { client, primaryContact, portfolioIds } = await buildClientAggregate(
      command,
      this.catalogRepo,
      this.geocodingService,
    );

    const history = ClientHistory.create({
      action: 'Cliente creado',
      user: currentUser?.name || currentUser?.email || 'Sistema',
      description: 'Cliente registrado mediante formulario',
    });

    // 3. Persistir atómicamente en una sola transacción
    return this.clientRepo.saveWithRelations({
      client,
      primaryContact,
      portfolioIds,
      history,
    });
  }
}
