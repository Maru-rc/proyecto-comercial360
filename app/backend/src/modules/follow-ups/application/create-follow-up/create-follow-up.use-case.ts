import { Inject, Injectable } from '@nestjs/common';
import { FollowUp } from '../../domain/entities/follow-up.entity.js';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up-repository.port.js';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up-repository.port.js';

export interface CreateFollowUpInputDto {
  clientId: number;
  visitId?: number | null;
  responsibleAdvisorId?: number | null;
  nextContactDate: Date | string;
  activity: string;
  observation?: string | null;
}

@Injectable()
export class CreateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(dto: CreateFollowUpInputDto): Promise<FollowUp> {
    const nextContactDate =
      typeof dto.nextContactDate === 'string'
        ? new Date(dto.nextContactDate)
        : dto.nextContactDate;

    const followUp = FollowUp.create({
      clientId: dto.clientId,
      visitId: dto.visitId ?? null,
      responsibleAdvisorId: dto.responsibleAdvisorId ?? null,
      nextContactDate,
      activity: dto.activity,
      observation: dto.observation ?? null,
    });

    return this.followUpRepository.save(followUp);
  }
}
