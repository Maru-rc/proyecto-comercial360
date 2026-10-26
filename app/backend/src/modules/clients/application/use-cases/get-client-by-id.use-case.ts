import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientSummaryRecord,
} from '../ports/client.repository.port.js';
import { ClienteNoEncontradoError } from '../../domain/client.errors.js';

@Injectable()
export class GetClientByIdUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
  ) {}

  async execute(id: number): Promise<ClientSummaryRecord> {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw new ClienteNoEncontradoError(id);
    }
    return client;
  }
}
