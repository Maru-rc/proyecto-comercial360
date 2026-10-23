import { Inject, Injectable } from '@nestjs/common';
import type { FollowUp } from '../../domain/entities/follow-up.entity.js';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up-repository.port.js';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up-repository.port.js';

@Injectable()
export class ListPendingFollowUpsUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(clientId: number): Promise<FollowUp[]> {
    if (!clientId || clientId <= 0) {
      throw new Error('Client ID must be a positive integer');
    }
    return this.followUpRepository.findPendingByClient(clientId);
  }
}
