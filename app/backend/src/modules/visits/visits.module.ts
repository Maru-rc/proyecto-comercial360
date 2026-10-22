import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VISIT_READER } from '../../domain-contracts/visits/visit-reader.token.js';
import { GetMapUseCase } from './application/get-map/get-map.use-case.js';
import { GetVisitUseCase } from './application/get-visit/get-visit.use-case.js';
import { ListAgendaUseCase } from './application/list-agenda/list-agenda.use-case.js';
import { RecordVisitUseCase } from './application/record-visit/record-visit.use-case.js';
import { ScheduleVisitUseCase } from './application/schedule-visit/schedule-visit.use-case.js';
import { VISIT_UNIT_OF_WORK } from './application/ports/visit-unit-of-work.port.js';
import { VISIT_REPOSITORY } from './domain/repositories/visit-repository.port.js';
import { VisitOutcomeOrmEntity } from './infrastructure/persistence/entities/visit-outcome.orm-entity.js';
import { VisitOrmEntity } from './infrastructure/persistence/entities/visit.orm-entity.js';
import { TypeOrmVisitRepository } from './infrastructure/persistence/typeorm-visit.repository.js';
import { TypeOrmVisitUnitOfWork } from './infrastructure/persistence/typeorm-visit-unit-of-work.js';
import { VisitsController } from './interfaces/http/visits.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([VisitOrmEntity, VisitOutcomeOrmEntity])],
  controllers: [VisitsController],
  providers: [
    TypeOrmVisitRepository,
    {
      provide: VISIT_REPOSITORY,
      useExisting: TypeOrmVisitRepository,
    },
    {
      provide: VISIT_READER,
      useExisting: TypeOrmVisitRepository,
    },
    TypeOrmVisitUnitOfWork,
    {
      provide: VISIT_UNIT_OF_WORK,
      useExisting: TypeOrmVisitUnitOfWork,
    },
    ListAgendaUseCase,
    GetMapUseCase,
    RecordVisitUseCase,
    ScheduleVisitUseCase,
    GetVisitUseCase,
  ],
  exports: [
    VISIT_READER,
    VISIT_REPOSITORY,
    VISIT_UNIT_OF_WORK,
    ListAgendaUseCase,
    GetMapUseCase,
    RecordVisitUseCase,
    ScheduleVisitUseCase,
    GetVisitUseCase,
    TypeOrmVisitRepository,
    TypeOrmVisitUnitOfWork,
  ],
})
export class VisitsModule {}
