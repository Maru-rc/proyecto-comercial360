import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../../auth/public-api.js';
import { CompleteFollowUpUseCase } from '../../application/complete-follow-up/complete-follow-up.use-case.js';
import { CreateFollowUpUseCase } from '../../application/create-follow-up/create-follow-up.use-case.js';
import { ListPendingFollowUpsUseCase } from '../../application/list-pending-follow-ups/list-pending-follow-ups.use-case.js';
import { CreateFollowUpDto } from './dto/create-follow-up.dto.js';

// HU-10: requires a valid session (401 without a session)
@Auth()
@ApiTags('FollowUps')
@Controller('follow-ups')
export class FollowUpsController {
  constructor(
    private readonly createFollowUpUseCase: CreateFollowUpUseCase,
    private readonly listPendingFollowUpsUseCase: ListPendingFollowUpsUseCase,
    private readonly completeFollowUpUseCase: CompleteFollowUpUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule next contact follow-up activity' })
  @ApiResponse({ status: 201, description: 'Follow-up scheduled successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Validation error (observation > 500 characters, invalid date)',
  })
  async create(@Body() dto: CreateFollowUpDto) {
    const f = await this.createFollowUpUseCase.execute({
      clientId: dto.resolvedClientId,
      visitId: dto.resolvedVisitId,
      responsibleAdvisorId: dto.resolvedResponsibleAdvisorId,
      nextContactDate: dto.resolvedNextContactDate,
      activity: dto.resolvedActivity,
      observation: dto.resolvedObservation,
    });

    return {
      id: f.id,
      clientId: f.clientId,
      visitId: f.visitId,
      responsibleAdvisorId: f.responsibleAdvisorId,
      nextContactDate: f.nextContactDate,
      activity: f.activity,
      isCompleted: f.isCompleted,
      observation: f.observation,
      createdAt: f.createdAt,
    };
  }

  @Get('pending/:clientId')
  @ApiOperation({ summary: 'List pending follow-ups for a specific client' })
  @ApiResponse({ status: 200, description: 'List of pending follow-ups' })
  async listPending(@Param('clientId', ParseIntPipe) clientId: number) {
    const list = await this.listPendingFollowUpsUseCase.execute(clientId);
    return list.map((f) => ({
      id: f.id,
      clientId: f.clientId,
      visitId: f.visitId,
      responsibleAdvisorId: f.responsibleAdvisorId,
      nextContactDate: f.nextContactDate,
      activity: f.activity,
      isCompleted: f.isCompleted,
      observation: f.observation,
      createdAt: f.createdAt,
    }));
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark follow-up as completed' })
  @ApiResponse({ status: 200, description: 'Follow-up completed' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const f = await this.completeFollowUpUseCase.execute(id);
    return {
      id: f.id,
      clientId: f.clientId,
      visitId: f.visitId,
      responsibleAdvisorId: f.responsibleAdvisorId,
      nextContactDate: f.nextContactDate,
      activity: f.activity,
      isCompleted: f.isCompleted,
      observation: f.observation,
      createdAt: f.createdAt,
    };
  }
}
