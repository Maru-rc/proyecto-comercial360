import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, UserRole, type User } from '../../../auth/public-api.js';
import { ListAgendaUseCase } from '../../application/list-agenda/list-agenda.use-case.js';
import { GetMapUseCase } from '../../application/get-map/get-map.use-case.js';
import { RecordVisitUseCase } from '../../application/record-visit/record-visit.use-case.js';
import { ScheduleVisitUseCase } from '../../application/schedule-visit/schedule-visit.use-case.js';
import { GetVisitUseCase } from '../../application/get-visit/get-visit.use-case.js';
import {
  ListAgendaQueryDto,
  GetMapQueryDto,
} from './dto/list-agenda-query.dto.js';
import { RecordVisitOutcomeDto } from './dto/record-visit-outcome.dto.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';

@ApiTags('Visits')
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly listAgendaUseCase: ListAgendaUseCase,
    private readonly getMapUseCase: GetMapUseCase,
    private readonly recordVisitUseCase: RecordVisitUseCase,
    private readonly scheduleVisitUseCase: ScheduleVisitUseCase,
    private readonly getVisitUseCase: GetVisitUseCase,
  ) {}

  @Get('agenda')
  @ApiOperation({ summary: 'Get daily agenda of scheduled visits' })
  @ApiResponse({
    status: 200,
    description: 'List of scheduled visits for the given date',
  })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({
    status: 403,
    description: 'Advisor attempting to view another advisor agenda',
  })
  async getAgenda(
    @Query() query: ListAgendaQueryDto,
    @CurrentUser() user?: User,
  ) {
    let targetAdvisorId = query.targetAdvisorId;

    if (user && user.role === UserRole.ADVISOR) {
      const numericUserId = Number(user.id);
      if (!Number.isNaN(numericUserId) && numericUserId > 0) {
        if (targetAdvisorId && targetAdvisorId !== numericUserId) {
          throw new ForbiddenException(
            'Advisors are only authorized to view their own agenda',
          );
        }
        targetAdvisorId = numericUserId;
      }
    }

    return this.listAgendaUseCase.execute({
      date: query.targetDate,
      advisorId: targetAdvisorId,
    });
  }

  @Get('map')
  @ApiOperation({
    summary: 'Get daily map route stops with dynamic pin statuses',
  })
  @ApiResponse({
    status: 200,
    description: 'Geocoded map stops with 5 dynamic pin status colors',
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({
    status: 403,
    description: 'Advisor attempting to view another advisor map',
  })
  async getMap(@Query() query: GetMapQueryDto, @CurrentUser() user?: User) {
    let targetAdvisorId = query.targetAdvisorId;

    if (user && user.role === UserRole.ADVISOR) {
      const numericUserId = Number(user.id);
      if (!Number.isNaN(numericUserId) && numericUserId > 0) {
        if (targetAdvisorId && targetAdvisorId !== numericUserId) {
          throw new ForbiddenException(
            'Advisors are only authorized to view their own route map',
          );
        }
        targetAdvisorId = numericUserId;
      }
    }

    return this.getMapUseCase.execute({
      date: query.targetDate,
      advisorId: targetAdvisorId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an unscheduled/unplanned visit' })
  @ApiResponse({ status: 201, description: 'Visit successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async createUnscheduledVisit(
    @Body() dto: CreateVisitDto,
    @CurrentUser() user?: User,
  ) {
    const userNumericId = user ? Number(user.id) : NaN;
    const advisorId =
      dto.resolvedAdvisorId ??
      (!Number.isNaN(userNumericId) && userNumericId > 0 ? userNumericId : 1);

    const visit = await this.scheduleVisitUseCase.execute({
      clientId: dto.resolvedClientId,
      advisorId,
      routeId: dto.resolvedRouteId,
      scheduledDate: dto.resolvedScheduledDate,
      visitOrder: dto.resolvedVisitOrder,
      startTime: dto.resolvedStartTime ?? undefined,
      visitType: dto.resolvedVisitType,
      objective: dto.resolvedObjective ?? undefined,
    });

    return {
      id: visit.id,
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      routeId: visit.routeId,
      scheduledDate: visit.scheduledDate,
      visitOrder: visit.visitOrder,
      visitStatus: visit.visitStatus,
      status: visit.visitStatus,
      visitType: visit.visitType,
      objective: visit.objective,
      createdAt: visit.createdAt,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Record outcome of a scheduled visit within an atomic ACID transaction',
  })
  @ApiResponse({
    status: 200,
    description:
      'Visit outcome and embedded quotes/orders/follow-ups registered',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Visit or client not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate quotation/order number or state conflict',
  })
  async recordVisitOutcome(
    @Param('id', ParseIntPipe) visitId: number,
    @Body() dto: RecordVisitOutcomeDto,
    @CurrentUser() user?: User,
  ) {
    const quotation = dto.resolvedQuotation;
    const order = dto.resolvedOrder;
    const followUp = dto.resolvedFollowUp;

    const result = await this.recordVisitUseCase.execute({
      visitId,
      outcome: dto.resolvedOutcome,
      reasonNoSale: dto.resolvedReasonNoSale,
      observations: dto.resolvedObservations,
      evidenceS3Key: dto.resolvedEvidenceS3Key,
      endTime: dto.resolvedEndTime,
      rescheduledDate: dto.resolvedRescheduledDate,
      quotation: quotation
        ? {
            number: quotation.resolvedNumber,
            amount: quotation.resolvedAmount,
            currency: quotation.resolvedCurrency,
          }
        : undefined,
      order: order
        ? {
            number: order.resolvedNumber,
            amount: order.resolvedAmount,
            estimatedDeliveryDate: order.resolvedEstimatedDeliveryDate,
          }
        : undefined,
      followUp: followUp
        ? {
            nextContactDate: followUp.resolvedNextDate,
            activity: followUp.resolvedActivity,
            observation: followUp.resolvedObservation,
          }
        : undefined,
      user:
        dto.resolvedUser ?? (user ? `${user.role}:${user.email}` : 'ADVISOR'),
    });

    return {
      visitId: result.visitId,
      outcome: result.outcome,
      quotationId: result.quotationId,
      orderId: result.orderId,
      followUpId: result.followUpId,
      rescheduledVisitId: result.rescheduledVisitId,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visit details by ID' })
  @ApiResponse({ status: 200, description: 'Visit found' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async getVisit(@Param('id', ParseIntPipe) id: number) {
    const visit = await this.getVisitUseCase.execute(id);
    return {
      id: visit.id,
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      routeId: visit.routeId,
      scheduledDate: visit.scheduledDate,
      visitOrder: visit.visitOrder,
      startTime: visit.startTime,
      endTime: visit.endTime,
      visitStatus: visit.visitStatus,
      status: visit.visitStatus,
      visitType: visit.visitType,
      objective: visit.objective,
      observation: visit.observation,
      evidenceS3Key: visit.evidenceS3Key,
      createdAt: visit.createdAt,
    };
  }
}
