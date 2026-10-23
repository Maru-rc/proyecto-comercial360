import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CLIENT_READER } from '../../../../domain-contracts/index.js';
import type {
  ClientReader,
  VisitAgendaItemContractDto,
  VisitContractDto,
  VisitMapStopContractDto,
  VisitReader,
} from '../../../../domain-contracts/index.js';
import { VisitOutcome } from '../../domain/entities/visit-outcome.entity.js';
import type { OutcomeType } from '../../domain/entities/visit-outcome.entity.js';
import type { Visit } from '../../domain/entities/visit.entity.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';
import { VisitOutcomeOrmEntity } from './entities/visit-outcome.orm-entity.js';
import { VisitOrmEntity } from './entities/visit.orm-entity.js';
import { VisitMapper } from './mappers/visit.mapper.js';

@Injectable()
export class TypeOrmVisitRepository implements IVisitRepository, VisitReader {
  constructor(
    @InjectRepository(VisitOrmEntity)
    private readonly visitRepo: Repository<VisitOrmEntity>,
    @InjectRepository(VisitOutcomeOrmEntity)
    private readonly outcomeRepo: Repository<VisitOutcomeOrmEntity>,
    @Optional()
    @Inject(CLIENT_READER)
    private readonly clientReader?: ClientReader,
  ) {}

  async save(visit: Visit): Promise<Visit> {
    const orm = VisitMapper.toOrm(visit);
    const saved = await this.visitRepo.save(orm);
    return VisitMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Visit | null> {
    const entity = await this.visitRepo.findOne({ where: { id } });
    return entity ? VisitMapper.toDomain(entity) : null;
  }

  async findByAdvisorAndDate(
    advisorId: number,
    date: string,
  ): Promise<Visit[]> {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const list = await this.visitRepo.find({
      where: {
        advisorId,
        scheduledDate: Between(start, end),
      },
      order: { visitOrder: 'ASC' },
    });
    return list.map((item) => VisitMapper.toDomain(item));
  }

  async findByDate(date: string): Promise<Visit[]> {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const list = await this.visitRepo.find({
      where: {
        scheduledDate: Between(start, end),
      },
      order: { visitOrder: 'ASC' },
    });
    return list.map((item) => VisitMapper.toDomain(item));
  }

  async findAll(): Promise<Visit[]> {
    const list = await this.visitRepo.find({
      order: { scheduledDate: 'DESC' },
    });
    return list.map((item) => VisitMapper.toDomain(item));
  }

  async saveOutcome(outcome: VisitOutcome): Promise<VisitOutcome> {
    const orm = new VisitOutcomeOrmEntity();
    if (outcome.id !== undefined) {
      orm.id = outcome.id;
    }
    orm.visitId = outcome.visitId;
    orm.outcome = outcome.outcome;
    orm.reasonNoSale = outcome.reasonNoSale ?? null;
    orm.observations = outcome.observations ?? null;
    orm.evidenceS3Key = outcome.evidenceS3Key ?? null;

    const saved = await this.outcomeRepo.save(orm);
    return VisitOutcome.create({
      id: saved.id,
      visitId: saved.visitId,
      outcome: saved.outcome as OutcomeType,
      reasonNoSale: saved.reasonNoSale,
      observations: saved.observations,
      evidenceS3Key: saved.evidenceS3Key,
      createdAt: saved.createdAt,
    });
  }

  async findOutcomeByVisit(visitId: number): Promise<VisitOutcome | null> {
    const entity = await this.outcomeRepo.findOne({ where: { visitId } });
    if (!entity) return null;
    return VisitOutcome.create({
      id: entity.id,
      visitId: entity.visitId,
      outcome: entity.outcome as OutcomeType,
      reasonNoSale: entity.reasonNoSale,
      observations: entity.observations,
      evidenceS3Key: entity.evidenceS3Key,
      createdAt: entity.createdAt,
    });
  }

  async getVisitById(id: number): Promise<VisitContractDto | null> {
    const visit = await this.findById(id);
    return visit ? VisitMapper.toContract(visit) : null;
  }

  async getDailyAgenda(
    date: string,
    advisorId?: number,
  ): Promise<VisitAgendaItemContractDto[]> {
    const visits = advisorId
      ? await this.findByAdvisorAndDate(advisorId, date)
      : await this.findByDate(date);
    return VisitMapper.toDailyAgenda(visits, this.clientReader);
  }

  async getMapStops(
    date: string,
    advisorId?: number,
  ): Promise<VisitMapStopContractDto[]> {
    const agenda = await this.getDailyAgenda(date, advisorId);
    return VisitMapper.toMapStops(agenda);
  }
}
