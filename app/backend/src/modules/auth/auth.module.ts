import { Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Pool } from 'pg';
import { AsesorOrmEntity } from './infrastructure/persistence/entities/asesor.orm-entity.js';
import { createPgPool } from './infrastructure/better-auth/pg-pool.js';
import { ASESOR_REPOSITORY } from './application/ports/asesor.repository.js';
import { GetMeUseCase } from './application/use-cases/get-me.use-case.js';
import { ResolveAsesorScopeUseCase } from './application/use-cases/resolve-asesor-scope.use-case.js';
import { AUTH, createAuth } from './infrastructure/better-auth/auth.factory.js';
import { TypeOrmAsesorRepository } from './infrastructure/persistence/typeorm-asesor.repository.js';
import { AuthGuard } from './presentation/auth.guard.js';
import { DomainErrorsFilter } from './presentation/domain-errors.filter.js';
import { MeController } from './presentation/me.controller.js';
import { RolesGuard } from './presentation/roles.guard.js';

const PG_POOL = Symbol('PG_POOL');

@Module({
  imports: [TypeOrmModule.forFeature([AsesorOrmEntity])],
  controllers: [MeController],
  providers: [
    { provide: PG_POOL, useFactory: () => createPgPool() },
    {
      provide: AUTH,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => createAuth(pool),
    },
    { provide: ASESOR_REPOSITORY, useClass: TypeOrmAsesorRepository },
    { provide: APP_FILTER, useClass: DomainErrorsFilter },
    GetMeUseCase,
    ResolveAsesorScopeUseCase,
    {
      provide: 'ResolveAsesorScopeUseCase',
      useExisting: ResolveAsesorScopeUseCase,
    },
    AuthGuard,
    RolesGuard,
  ],
  // Los demás módulos usan estos guards, @Auth() y el caso de uso de alcance
  exports: [
    AUTH,
    AuthGuard,
    RolesGuard,
    ResolveAsesorScopeUseCase,
    'ResolveAsesorScopeUseCase',
  ],
})
export class AuthModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
