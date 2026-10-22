import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  FollowUpContractDto,
  FollowUpReader,
} from '../../../../domain-contracts/index.js';
import type { FollowUp } from '../../domain/entities/follow-up.entity.js';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up-repository.port.js';
import { FollowUpOrmEntity } from './entities/follow-up.orm-entity.js';
import { FollowUpMapper } from './mappers/follow-up.mapper.js';

@Injectable()
export class TypeOrmFollowUpRepository
  implements IFollowUpRepository, FollowUpReader
{
  constructor(
    @InjectRepository(FollowUpOrmEntity)
    private readonly repository: Repository<FollowUpOrmEntity>,
  ) {}

  async save(followUp: FollowUp): Promise<FollowUp> {
    const orm = FollowUpMapper.toOrm(followUp);
    const saved = await this.repository.save(orm);
    return FollowUpMapper.toDomain(saved);
  }

  async findById(id: number): Promise<FollowUp | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? FollowUpMapper.toDomain(entity) : null;
  }

  async findByClient(clientId: number): Promise<FollowUp[]> {
    const list = await this.repository.find({
      where: { clientId },
      order: { nextContactDate: 'ASC' },
    });
    return list.map((item) => FollowUpMapper.toDomain(item));
  }

  async findPendingByClient(clientId: number): Promise<FollowUp[]> {
    const list = await this.repository.find({
      where: { clientId, isCompleted: false },
      order: { nextContactDate: 'ASC' },
    });
    return list.map((item) => FollowUpMapper.toDomain(item));
  }

  async findAll(): Promise<FollowUp[]> {
    const list = await this.repository.find({
      order: { nextContactDate: 'ASC' },
    });
    return list.map((item) => FollowUpMapper.toDomain(item));
  }

  async getPendingByClient(clientId: number): Promise<FollowUpContractDto[]> {
    const pending = await this.findPendingByClient(clientId);
    return pending.map((f) => FollowUpMapper.toContract(f));
  }
}
