import type { FollowUpContractDto } from '../../../../../domain-contracts/index.js';
import { FollowUp } from '../../../domain/entities/follow-up.entity.js';
import { FollowUpOrmEntity } from '../entities/follow-up.orm-entity.js';

export class FollowUpMapper {
  static toDomain(orm: FollowUpOrmEntity): FollowUp {
    return FollowUp.create({
      id: orm.id,
      clientId: orm.clientId ?? 0,
      visitId: orm.visitId,
      responsibleAdvisorId: orm.responsibleAdvisorId,
      nextContactDate: orm.nextContactDate,
      activity: orm.activity,
      isCompleted: orm.isCompleted,
      observation: orm.observation,
    });
  }

  static toOrm(domain: FollowUp): FollowUpOrmEntity {
    const orm = new FollowUpOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.clientId = domain.clientId;
    orm.visitId = domain.visitId ?? null;
    orm.responsibleAdvisorId = domain.responsibleAdvisorId ?? null;
    orm.nextContactDate = domain.nextContactDate;
    orm.activity = domain.activity;
    orm.isCompleted = domain.isCompleted;
    orm.observation = domain.observation ?? null;
    return orm;
  }

  static toContract(domain: FollowUp): FollowUpContractDto {
    return {
      id: domain.id ?? 0,
      clientId: domain.clientId,
      visitId: domain.visitId,
      responsibleAdvisorId: domain.responsibleAdvisorId,
      nextContactDate: domain.nextContactDate,
      activity: domain.activity,
      isCompleted: domain.isCompleted,
      observation: domain.observation,
    };
  }
}
