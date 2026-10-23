import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Visit } from '../../domain/entities/visit.entity.js';
import { VISIT_REPOSITORY } from '../../domain/repositories/visit-repository.port.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

@Injectable()
export class GetVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
  ) {}

  async execute(id: number): Promise<Visit> {
    const visit = await this.visitRepository.findById(id);
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }
    return visit;
  }
}
