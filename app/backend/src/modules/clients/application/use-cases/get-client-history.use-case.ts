import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type ClientHistoryRecord,
  type ClientRepository,
} from '../ports/client.repository.port.js';
import { ClienteNoEncontradoError } from '../../domain/client.errors.js';

@Injectable()
export class GetClientHistoryUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
  ) {}

  async execute(clientId: number, limit = 3): Promise<ClientHistoryRecord[]> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new ClienteNoEncontradoError(clientId);
    }

    return this.clientRepo.findHistoryByClientId(clientId, limit);
  }
}
