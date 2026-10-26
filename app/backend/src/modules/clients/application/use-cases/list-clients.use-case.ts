import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientSummaryRecord,
} from '../ports/client.repository.port.js';

export interface ListClientsFilter {
  search?: string;
  tipo?: string;
  zona?: string;
}

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
  ) {}

  async execute(filter?: ListClientsFilter): Promise<ClientSummaryRecord[]> {
    return this.clientRepo.findAll(filter);
  }
}
