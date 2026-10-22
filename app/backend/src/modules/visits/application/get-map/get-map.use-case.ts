import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  CLIENT_READER,
  ORDER_READER,
} from '../../../../domain-contracts/index.js';
import type {
  ClientReader,
  MapPinStatus,
  OrderReader,
  VisitMapStopContractDto,
} from '../../../../domain-contracts/index.js';
import { VISIT_REPOSITORY } from '../../domain/repositories/visit-repository.port.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

export interface GetMapInputDto {
  date: string;
  advisorId?: number;
}

export const MAP_PIN_COLORS: Record<
  MapPinStatus,
  { color: string; colorHex: string }
> = {
  VISITED: { color: 'green', colorHex: '#22c55e' },
  PENDING: { color: 'orange', colorHex: '#f97316' },
  NOT_VISITED: { color: 'gray', colorHex: '#6b7280' },
  ORDER_CLOSED: { color: 'blue', colorHex: '#3b82f6' },
  RESCHEDULED: { color: 'red', colorHex: '#ef4444' },
};

@Injectable()
export class GetMapUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
    @Optional()
    @Inject(CLIENT_READER)
    private readonly clientReader?: ClientReader,
    @Optional()
    @Inject(ORDER_READER)
    private readonly orderReader?: OrderReader,
  ) {}

  async execute(dto: GetMapInputDto): Promise<VisitMapStopContractDto[]> {
    const visits = dto.advisorId
      ? await this.visitRepository.findByAdvisorAndDate(dto.advisorId, dto.date)
      : await this.visitRepository.findByDate(dto.date);

    return Promise.all(
      visits.map(async (v) => {
        const coords = this.clientReader
          ? await this.clientReader.getCoordinatesById(v.clientId)
          : null;

        const summary = this.clientReader
          ? await this.clientReader.getSummaryById(v.clientId)
          : null;

        const outcome = v.id
          ? await this.visitRepository.findOutcomeByVisit(v.id)
          : null;

        const pinStatus = await this.determinePinStatus(
          v.visitStatus,
          outcome?.outcome,
          v.id,
        );
        const colorInfo = MAP_PIN_COLORS[pinStatus];

        return {
          id: v.id ?? 0,
          clientId: v.clientId,
          clientName: summary?.legalName ?? `Client #${v.clientId}`,
          address: summary?.address ?? null,
          order: v.visitOrder,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          pinStatus,
          color: colorInfo.color,
          colorHex: colorInfo.colorHex,
        };
      }),
    );
  }

  private async determinePinStatus(
    visitStatus: string,
    outcome?: string,
    visitId?: number,
  ): Promise<MapPinStatus> {
    if (
      visitStatus === 'COMPLETED' ||
      outcome === 'SUCCESSFUL' ||
      visitStatus === 'REALIZADA' ||
      outcome === 'EXITOSA'
    ) {
      const hasOrder =
        visitId && this.orderReader?.hasOrderByVisit
          ? await this.orderReader.hasOrderByVisit(visitId)
          : false;
      return hasOrder ? 'ORDER_CLOSED' : 'VISITED';
    }
    if (
      visitStatus === 'RESCHEDULED' ||
      outcome === 'RESCHEDULED' ||
      visitStatus === 'REPROGRAMADA' ||
      outcome === 'REPROGRAMADA'
    ) {
      return 'RESCHEDULED';
    }
    if (
      visitStatus === 'CANCELLED' ||
      outcome === 'CANCELLED' ||
      visitStatus === 'CANCELADA' ||
      outcome === 'CANCELADA'
    ) {
      return 'NOT_VISITED';
    }
    return 'PENDING';
  }
}
