import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { OutcomeType } from '../../domain/entities/visit-outcome.entity.js';
import { VisitOutcome } from '../../domain/entities/visit-outcome.entity.js';
import { Visit } from '../../domain/entities/visit.entity.js';
import { VISIT_UNIT_OF_WORK } from '../ports/visit-unit-of-work.port.js';
import type {
  IVisitUnitOfWork,
  VisitTransactionalContext,
} from '../ports/visit-unit-of-work.port.js';

export interface RecordVisitInputDto {
  visitId?: number | null;
  clientId?: number;
  advisorId?: number;
  outcome: OutcomeType;
  reasonNoSale?: string;
  observations?: string;
  evidenceS3Key?: string;
  endTime?: string;
  rescheduledDate?: string | Date;
  quotation?: {
    number: string;
    amount: number;
    currency?: string;
  };
  order?: {
    number: string;
    amount: number;
    estimatedDeliveryDate?: string | Date;
  };
  followUp?: {
    nextContactDate: string | Date;
    activity: string;
    observation?: string;
  };
  user?: string;
}

export interface RecordVisitOutputDto {
  visitId: number;
  outcome: OutcomeType;
  quotationId?: number;
  orderId?: number;
  followUpId?: number;
  rescheduledVisitId?: number;
}

@Injectable()
export class RecordVisitUseCase {
  constructor(
    @Inject(VISIT_UNIT_OF_WORK)
    private readonly unitOfWork: IVisitUnitOfWork,
  ) {}

  async execute(dto: RecordVisitInputDto): Promise<RecordVisitOutputDto> {
    if (dto.observations && dto.observations.length > 500) {
      throw new BadRequestException(
        'Observations cannot exceed 500 characters',
      );
    }

    return this.unitOfWork.runInTransaction(async (ctx) => {
      const visit = await this.resolveOrCreateVisit(ctx, dto);
      await this.saveOutcome(ctx, visit, dto);

      const rescheduledVisitId = await this.handleAutomaticReschedule(
        ctx,
        visit,
        dto,
      );
      const savedQuote = await this.saveQuotation(ctx, visit, dto);
      const savedOrder = await this.saveOrder(ctx, visit, dto, savedQuote?.id);
      const savedFollowUp = await this.saveFollowUp(ctx, visit, dto);

      await this.recordAuditHistory(
        ctx,
        visit,
        dto,
        savedQuote,
        savedOrder,
        savedFollowUp,
      );

      return {
        visitId: visit.id!,
        outcome: dto.outcome,
        quotationId: savedQuote?.id,
        orderId: savedOrder?.id,
        followUpId: savedFollowUp?.id,
        rescheduledVisitId,
      };
    });
  }

  private async resolveOrCreateVisit(
    ctx: VisitTransactionalContext,
    dto: RecordVisitInputDto,
  ): Promise<Visit> {
    if (dto.visitId) {
      const existing = await ctx.visitRepo.findById(dto.visitId);
      if (!existing) {
        throw new NotFoundException(`Visit with ID ${dto.visitId} not found`);
      }
      this.updateVisitStatus(existing, dto);
      await ctx.visitRepo.save(existing);
      return existing;
    }

    if (!dto.clientId || !dto.advisorId) {
      throw new BadRequestException(
        'For unplanned visits, clientId and advisorId are required',
      );
    }

    const visit = Visit.create({
      clientId: dto.clientId,
      advisorId: dto.advisorId,
      scheduledDate: new Date(),
      visitStatus: dto.outcome === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
      observation: dto.observations,
      evidenceS3Key: dto.evidenceS3Key,
      endTime: dto.endTime,
    });
    return ctx.visitRepo.save(visit);
  }

  private async saveOutcome(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
  ): Promise<void> {
    const outcome = VisitOutcome.create({
      visitId: visit.id!,
      outcome: dto.outcome,
      reasonNoSale: dto.reasonNoSale,
      observations: dto.observations,
      evidenceS3Key: dto.evidenceS3Key,
    });
    await ctx.visitRepo.saveOutcome(outcome);
  }

  private async handleAutomaticReschedule(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
  ): Promise<number | undefined> {
    if (dto.outcome !== 'RESCHEDULED') {
      return undefined;
    }

    const nextDate = dto.rescheduledDate
      ? new Date(dto.rescheduledDate)
      : dto.followUp?.nextContactDate
        ? new Date(dto.followUp.nextContactDate)
        : new Date(Date.now() + 86400000);

    const newVisit = Visit.create({
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      routeId: visit.routeId,
      scheduledDate: nextDate,
      visitStatus: 'SCHEDULED',
      objective: `Rescheduled visit: ${dto.observations ?? 'No details'}`,
      visitType: visit.visitType,
    });
    const savedNewVisit = await ctx.visitRepo.save(newVisit);
    return savedNewVisit.id;
  }

  private async saveQuotation(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
  ): Promise<{ id: number; number: string } | undefined> {
    if (!dto.quotation || !ctx.saveQuotation) {
      return undefined;
    }
    return ctx.saveQuotation({
      number: dto.quotation.number,
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      visitId: visit.id,
      amount: dto.quotation.amount,
      currency: dto.quotation.currency,
    });
  }

  private async saveOrder(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
    quotationId?: number | null,
  ): Promise<{ id: number; number: string } | undefined> {
    if (!dto.order || !ctx.saveOrder) {
      return undefined;
    }
    const estimatedDeliveryDate = dto.order.estimatedDeliveryDate
      ? new Date(dto.order.estimatedDeliveryDate)
      : null;

    return ctx.saveOrder({
      number: dto.order.number,
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      visitId: visit.id,
      quotationId: quotationId ?? null,
      amount: dto.order.amount,
      estimatedDeliveryDate,
    });
  }

  private async saveFollowUp(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
  ): Promise<{ id: number } | undefined> {
    if (!dto.followUp || !ctx.saveFollowUp) {
      return undefined;
    }
    const nextContactDate = new Date(dto.followUp.nextContactDate);
    return ctx.saveFollowUp({
      clientId: visit.clientId,
      visitId: visit.id,
      responsibleAdvisorId: visit.advisorId,
      nextContactDate,
      activity: dto.followUp.activity,
      observation: dto.followUp.observation,
    });
  }

  private async recordAuditHistory(
    ctx: VisitTransactionalContext,
    visit: Visit,
    dto: RecordVisitInputDto,
    savedQuote?: { id: number; number: string },
    savedOrder?: { id: number; number: string },
    savedFollowUp?: { id: number },
  ): Promise<void> {
    if (!ctx.recordHistory) return;

    const user = dto.user ?? 'ADVISOR';
    await ctx.recordHistory({
      clientId: visit.clientId,
      visitId: visit.id,
      quotationId: savedQuote?.id,
      orderId: savedOrder?.id,
      action: 'VISIT_RECORDED',
      user,
      description: `Visit ${dto.outcome}: ${dto.observations ?? 'No observations'}`,
    });

    if (savedQuote) {
      await this.recordQuoteAudit(
        ctx,
        visit,
        savedQuote,
        dto.quotation!.amount,
        user,
      );
    }
    if (savedOrder) {
      await this.recordOrderAudit(
        ctx,
        visit,
        savedOrder,
        dto.order!.amount,
        user,
      );
    }
    if (savedFollowUp) {
      await this.recordFollowUpAudit(ctx, visit, dto.followUp!.activity, user);
    }
  }

  private async recordQuoteAudit(
    ctx: VisitTransactionalContext,
    visit: Visit,
    savedQuote: { id: number; number: string },
    amount: number,
    user: string,
  ): Promise<void> {
    await ctx.recordHistory!({
      clientId: visit.clientId,
      visitId: visit.id,
      quotationId: savedQuote.id,
      action: 'QUOTATION_CREATED',
      user,
      description: `Quotation ${savedQuote.number} for amount ${amount}`,
    });
  }

  private async recordOrderAudit(
    ctx: VisitTransactionalContext,
    visit: Visit,
    savedOrder: { id: number; number: string },
    amount: number,
    user: string,
  ): Promise<void> {
    await ctx.recordHistory!({
      clientId: visit.clientId,
      visitId: visit.id,
      orderId: savedOrder.id,
      action: 'ORDER_CREATED',
      user,
      description: `Order ${savedOrder.number} for amount ${amount}`,
    });
  }

  private async recordFollowUpAudit(
    ctx: VisitTransactionalContext,
    visit: Visit,
    activity: string,
    user: string,
  ): Promise<void> {
    await ctx.recordHistory!({
      clientId: visit.clientId,
      visitId: visit.id,
      action: 'FOLLOW_UP_SCHEDULED',
      user,
      description: `Scheduled follow-up: ${activity}`,
    });
  }

  private updateVisitStatus(visit: Visit, dto: RecordVisitInputDto): void {
    if (dto.outcome === 'RESCHEDULED') {
      const date = dto.rescheduledDate
        ? new Date(dto.rescheduledDate)
        : new Date();
      visit.reschedule(date, dto.observations);
    } else if (dto.outcome === 'CANCELLED') {
      visit.cancel(dto.observations);
    } else {
      visit.complete(dto.observations, dto.evidenceS3Key, dto.endTime);
    }
  }
}
