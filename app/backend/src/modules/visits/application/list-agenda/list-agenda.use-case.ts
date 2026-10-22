import { Inject, Injectable, Optional } from '@nestjs/common';
import { CLIENT_READER } from '../../../../domain-contracts/index.js';
import type {
  ClientReader,
  VisitAgendaItemContractDto,
} from '../../../../domain-contracts/index.js';
import { VISIT_REPOSITORY } from '../../domain/repositories/visit-repository.port.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

export interface ListAgendaInputDto {
  date: string;
  advisorId?: number;
}

@Injectable()
export class ListAgendaUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
    @Optional()
    @Inject(CLIENT_READER)
    private readonly clientReader?: ClientReader,
  ) {}

  async execute(
    dto: ListAgendaInputDto,
  ): Promise<VisitAgendaItemContractDto[]> {
    const visits = dto.advisorId
      ? await this.visitRepository.findByAdvisorAndDate(dto.advisorId, dto.date)
      : await this.visitRepository.findByDate(dto.date);

    // Identify active/current visit:
    // Priority 1: First visit in 'IN_PROGRESS'
    // Priority 2: If none, first visit in 'SCHEDULED'
    const activeVisit =
      visits.find((v) => v.visitStatus === 'IN_PROGRESS') ??
      visits.find((v) => v.visitStatus === 'SCHEDULED');
    const activeVisitId = activeVisit?.id;

    return Promise.all(
      visits.map(async (v) => {
        const clientSummary = this.clientReader
          ? await this.clientReader.getSummaryById(v.clientId)
          : null;

        const coords = this.clientReader
          ? await this.clientReader.getCoordinatesById(v.clientId)
          : null;

        const isCurrent = activeVisitId !== undefined && v.id === activeVisitId;

        return {
          id: v.id ?? 0,
          clientId: v.clientId,
          clientName: clientSummary?.legalName ?? `Client #${v.clientId}`,
          clientAddress: clientSummary?.address ?? null,
          address: clientSummary?.address ?? null,
          visitOrder: v.visitOrder,
          order: v.visitOrder,
          suggestedTime: v.startTime,
          time: v.startTime ?? undefined,
          visitStatus: v.visitStatus,
          status: v.visitStatus,
          potential: clientSummary?.potential ?? undefined,
          objective: v.objective,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          contactName: clientSummary?.primaryContact?.name ?? null,
          contactPhone: clientSummary?.primaryContact?.phone ?? null,
          primaryContact: clientSummary?.primaryContact
            ? {
                name: clientSummary.primaryContact.name,
                phone: clientSummary.primaryContact.phone,
              }
            : null,
          isCurrent,
          active: isCurrent,
        };
      }),
    );
  }
}
