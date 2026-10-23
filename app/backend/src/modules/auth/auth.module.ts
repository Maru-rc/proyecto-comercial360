import { Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Pool } from 'pg';
import { AdvisorOrmEntity } from './infrastructure/persistence/entities/advisor.orm-entity.js';
import { createPgPool } from './infrastructure/better-auth/pg-pool.js';
import { ADVISOR_REPOSITORY } from './application/ports/advisor.repository.js';
import { GetMeUseCase } from './application/use-cases/get-me.use-case.js';
import { ResolveAdvisorScopeUseCase } from './application/use-cases/resolve-advisor-scope.use-case.js';
import { AUTH, createAuth } from './infrastructure/better-auth/auth.factory.js';
import { TypeOrmAdvisorRepository } from './infrastructure/persistence/typeorm-advisor.repository.js';
import { AuthGuard } from './presentation/auth.guard.js';
import { DomainErrorsFilter } from './presentation/domain-errors.filter.js';
import { MeController } from './presentation/me.controller.js';
import { RolesGuard } from './presentation/roles.guard.js';

const PG_POOL = Symbol('PG_POOL');

@Module({
  imports: [TypeOrmModule.forFeature([AdvisorOrmEntity])],
  controllers: [MeController],
  providers: [
    { provide: PG_POOL, useFactory: () => createPgPool() },
    {
      provide: AUTH,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => createAuth(pool),
    },
    { provide: ADVISOR_REPOSITORY, useClass: TypeOrmAdvisorRepository },
    { provide: APP_FILTER, useClass: DomainErrorsFilter },
    GetMeUseCase,
    ResolveAdvisorScopeUseCase,
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    AUTH,
    AuthGuard,
    RolesGuard,
    ResolveAdvisorScopeUseCase,
    ADVISOR_REPOSITORY,
  ],
})
export class AuthModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
