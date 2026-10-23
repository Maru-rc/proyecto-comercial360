import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { FollowUp } from '../../domain/entities/follow-up.entity.js';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up-repository.port.js';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up-repository.port.js';

@Injectable()
export class CompleteFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(id: number): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findById(id);
    if (!followUp) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    followUp.markCompleted();
    return this.followUpRepository.save(followUp);
  }
}
