import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CLIENT_READER } from '../../../../domain-contracts/index.js';
import type { ClientReader } from '../../../../domain-contracts/index.js';
import type { VisitOutcome } from '../../domain/entities/visit-outcome.entity.js';
import type { Visit } from '../../domain/entities/visit.entity.js';
import { BaseVisitRepository } from './base-visit.repository.js';
import { VisitOutcomeOrmEntity } from './entities/visit-outcome.orm-entity.js';
import { VisitOrmEntity } from './entities/visit.orm-entity.js';
import { VisitMapper } from './mappers/visit.mapper.js';

@Injectable()
export class TypeOrmVisitRepository extends BaseVisitRepository {
  constructor(
    @InjectRepository(VisitOrmEntity)
    private readonly visitRepo: Repository<VisitOrmEntity>,
    @InjectRepository(VisitOutcomeOrmEntity)
    private readonly outcomeRepo: Repository<VisitOutcomeOrmEntity>,
    @Optional()
    @Inject(CLIENT_READER)
    clientReader?: ClientReader,
  ) {
    super(clientReader);
  }

  async save(visit: Visit): Promise<Visit> {
    const orm = VisitMapper.toOrm(visit);
    const saved = await this.visitRepo.save(orm);
    return VisitMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Visit | null> {
    const entity = await this.visitRepo.findOne({ where: { id } });
    if (!entity) return null;
    // The observation lives in the latest recorded result (HU-24 detail view)
    const latest = await this.outcomeRepo.findOne({
      where: { visitId: id },
      order: { id: 'DESC' },
    });
    if (latest?.observations && !entity.observation) {
      entity.observation = latest.observations;
    }
    return VisitMapper.toDomain(entity);
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
      order: { scheduledDate: 'ASC', id: 'ASC' },
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
      order: { scheduledDate: 'ASC', id: 'ASC' },
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
    const orm = VisitMapper.outcomeToOrm(outcome);
    const saved = await this.outcomeRepo.save(orm);
    return VisitMapper.outcomeToDomain(saved);
  }

  async findOutcomeByVisit(visitId: number): Promise<VisitOutcome | null> {
    const entity = await this.outcomeRepo.findOne({ where: { visitId } });
    return entity ? VisitMapper.outcomeToDomain(entity) : null;
  }
}
