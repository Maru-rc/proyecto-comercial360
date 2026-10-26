import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Auth,
  CurrentUser,
  type User,
} from '../../../../domain-contracts/index.js';
import { AuthorizeVisitAccessUseCase } from '../../application/authorize-visit-access/authorize-visit-access.use-case.js';
import { ADVISOR_SCOPE_RESOLVER } from '../../application/ports/advisor-scope-resolver.port.js';
import type { AdvisorScopeResolver } from '../../application/ports/advisor-scope-resolver.port.js';
import { ListAgendaUseCase } from '../../application/list-agenda/list-agenda.use-case.js';
import { GetMapUseCase } from '../../application/get-map/get-map.use-case.js';
import { RecordVisitUseCase } from '../../application/record-visit/record-visit.use-case.js';
import { ScheduleVisitUseCase } from '../../application/schedule-visit/schedule-visit.use-case.js';
import {
  ListAgendaQueryDto,
  GetMapQueryDto,
} from './dto/list-agenda-query.dto.js';
import { RecordVisitOutcomeDto } from './dto/record-visit-outcome.dto.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';

// HU-10: every route requires a session (401). An advisor only sees and
// records their own visits; a director can see everything. The advisor id is
// NEVER taken from the client: it is resolved from the session
// (user.email = advisor.email).
@ApiTags('Visits')
@Auth()
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly listAgendaUseCase: ListAgendaUseCase,
    private readonly getMapUseCase: GetMapUseCase,
    private readonly recordVisitUseCase: RecordVisitUseCase,
    private readonly scheduleVisitUseCase: ScheduleVisitUseCase,
    private readonly authorizeVisitAccess: AuthorizeVisitAccessUseCase,
    @Inject(ADVISOR_SCOPE_RESOLVER)
    private readonly advisorScope: AdvisorScopeResolver,
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
    @CurrentUser() user: User,
  ) {
    // Advisor: always their own agenda (another id => 403). Director: the one
    // requested, or all of them.
    const advisorId = await this.advisorScope.execute(
      user,
      query.targetAdvisorId,
    );

    return this.listAgendaUseCase.execute({
      date: query.targetDate,
      advisorId: advisorId ?? undefined,
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
  async getMap(@Query() query: GetMapQueryDto, @CurrentUser() user: User) {
    const advisorId = await this.advisorScope.execute(
      user,
      query.targetAdvisorId,
    );

    return this.getMapUseCase.execute({
      date: query.targetDate,
      advisorId: advisorId ?? undefined,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an unscheduled/unplanned visit' })
  @ApiResponse({ status: 201, description: 'Visit successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({
    status: 403,
    description: 'Advisor attempting to create a visit for another advisor',
  })
  async createUnscheduledVisit(
    @Body() dto: CreateVisitDto,
    @CurrentUser() user: User,
  ) {
    // Advisor: the visit is created under their name. Director: must say which
    // advisor the visit belongs to.
    const advisorId = await this.advisorScope.execute(
      user,
      dto.resolvedAdvisorId,
    );
    if (advisorId === null) {
      throw new BadRequestException('advisorId is required for directors');
    }

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
  @ApiResponse({ status: 403, description: 'Visit belongs to another advisor' })
  @ApiResponse({ status: 404, description: 'Visit or client not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate quotation/order number or state conflict',
  })
  async recordVisitOutcome(
    @Param('id', ParseIntPipe) visitId: number,
    @Body() dto: RecordVisitOutcomeDto,
    @CurrentUser() user: User,
  ) {
    // 404 if it does not exist; 403 if it belongs to another advisor
    await this.authorizeVisitAccess.execute(user, visitId);

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
      // The recording user comes from the session, not from the request body
      user: `${user.role}:${user.email}`,
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
  @ApiResponse({ status: 403, description: 'Visit belongs to another advisor' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async getVisit(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const visit = await this.authorizeVisitAccess.execute(user, id);
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
