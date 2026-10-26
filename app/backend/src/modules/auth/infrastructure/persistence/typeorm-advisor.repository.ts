import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvisorOrmEntity } from './entities/advisor.orm-entity.js';
import {
  AdvisorRecord,
  AdvisorRepository,
} from '../../application/ports/advisor.repository.js';

@Injectable()
export class TypeOrmAdvisorRepository implements AdvisorRepository {
  constructor(
    @InjectRepository(AdvisorOrmEntity)
    private readonly repo: Repository<AdvisorOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<AdvisorRecord | null> {
    const entity = await this.repo
      .createQueryBuilder('a')
      .where('LOWER(a.email) = LOWER(:email)', { email })
      .getOne();

    if (!entity) return null;

    return {
      idAdvisor: entity.idAdvisor,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      status: entity.status,
    };
  }
}
