import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FOLLOW_UP_READER } from '../../domain-contracts/index.js';
import { CompleteFollowUpUseCase } from './application/complete-follow-up/complete-follow-up.use-case.js';
import { CreateFollowUpUseCase } from './application/create-follow-up/create-follow-up.use-case.js';
import { ListPendingFollowUpsUseCase } from './application/list-pending-follow-ups/list-pending-follow-ups.use-case.js';
import { FOLLOW_UP_REPOSITORY } from './domain/repositories/follow-up-repository.port.js';
import { FollowUpOrmEntity } from './infrastructure/persistence/entities/follow-up.orm-entity.js';
import { TypeOrmFollowUpRepository } from './infrastructure/persistence/typeorm-follow-up.repository.js';
import { FollowUpsController } from './interfaces/http/follow-ups.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUpOrmEntity])],
  controllers: [FollowUpsController],
  providers: [
    TypeOrmFollowUpRepository,
    {
      provide: FOLLOW_UP_REPOSITORY,
      useExisting: TypeOrmFollowUpRepository,
    },
    {
      provide: FOLLOW_UP_READER,
      useExisting: TypeOrmFollowUpRepository,
    },
    CreateFollowUpUseCase,
    ListPendingFollowUpsUseCase,
    CompleteFollowUpUseCase,
  ],
  exports: [
    FOLLOW_UP_READER,
    FOLLOW_UP_REPOSITORY,
    CreateFollowUpUseCase,
    ListPendingFollowUpsUseCase,
    CompleteFollowUpUseCase,
    TypeOrmFollowUpRepository,
  ],
})
export class FollowUpsModule {}
