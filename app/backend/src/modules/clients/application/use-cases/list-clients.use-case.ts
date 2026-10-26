import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientListFilter,
  type ClientSummaryRecord,
} from '../ports/client.repository.port.js';

export type ListClientsFilter = ClientListFilter;

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
  ) {}

  async execute(filter?: ListClientsFilter): Promise<ClientSummaryRecord[]> {
    if (!filter) return this.clientRepo.findAll();
    // Only the filters travel to the repository, never the raw query object
    const { search, tipo, zona, municipio, potencial } = filter;
    return this.clientRepo.findAll({
      search,
      tipo,
      zona,
      municipio,
      potencial,
    });
  }
}
