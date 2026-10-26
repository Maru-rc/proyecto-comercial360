import { Inject, Injectable } from '@nestjs/common';
import { Nit } from '../../domain/value-objects/nit.vo.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import {
  ClienteNoEncontradoError,
  ClienteYaExisteError,
} from '../../domain/client.errors.js';
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
import type { UserContext } from './create-client.use-case.js';

/** HU-23: a director edits a client; the change is logged in its history. */
@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepo: CatalogRepository,
    @Inject(GEOCODING_SERVICE)
    private readonly geocodingService: GeocodingService,
  ) {}

  async execute(
    id: number,
    command: ClientFormCommand,
    currentUser?: UserContext,
  ): Promise<ClientSummaryRecord> {
    const current = await this.clientRepo.findById(id);
    if (!current) {
      throw new ClienteNoEncontradoError(id);
    }

    // The NIT may change, but never to one that belongs to another client
    const nitVO = new Nit(command.nit);
    const owner = await this.clientRepo.findByTaxId(nitVO.value);
    if (owner && owner.id_cliente !== id) {
      throw new ClienteYaExisteError(nitVO.value);
    }

    const { client, primaryContact, portfolioIds } = await buildClientAggregate(
      command,
      this.catalogRepo,
      this.geocodingService,
    );

    const history = ClientHistory.create({
      action: 'Cliente actualizado',
      user: currentUser?.name || currentUser?.email || 'Sistema',
      description: 'Datos del cliente editados mediante formulario',
    });

    return this.clientRepo.updateWithRelations(id, {
      client,
      primaryContact,
      portfolioIds,
      history,
    });
  }
}
