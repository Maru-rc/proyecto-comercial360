import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AdvisorOrmEntity } from '../../../modules/auth/infrastructure/persistence/entities/advisor.orm-entity.js';
import { CreateSalesRepresentativesTable1792500000000 } from './migrations/1792500000000-CreateSalesRepresentativesTable.js';
import { CreateBetterAuthTables1792500000001 } from './migrations/1792500000001-CreateBetterAuthTables.js';
import { InitialSchema1792634405120 } from './migrations/1792634405120-InitialSchema.js';
import { AddVisitTrackingIndexes1792800000000 } from './migrations/1792800000000-AddVisitTrackingIndexes.js';
import { FixUserRoleCheck1792900000000 } from './migrations/1792900000000-FixUserRoleCheck.js';
import { AddCommercialVisitAndAdvisorLinks1793000000000 } from './migrations/1793000000000-AddCommercialVisitAndAdvisorLinks.js';
import { resolvePostgresConnection } from './postgres-connection.js';

try {
  process.loadEnvFile();
} catch (error: unknown) {
  if (!(
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  )) {
    throw error;
  }
}

export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  const connection = resolvePostgresConnection(env);
  return {
    type: 'postgres',
    host: connection.host,
    port: connection.port,
    username: connection.user,
    password: connection.password,
    database: connection.database,
    ssl: connection.ssl,
    entities: [AdvisorOrmEntity],
    migrations: [
      CreateSalesRepresentativesTable1792500000000,
      CreateBetterAuthTables1792500000001,
      InitialSchema1792634405120,
      AddVisitTrackingIndexes1792800000000,
      FixUserRoleCheck1792900000000,
      AddCommercialVisitAndAdvisorLinks1793000000000,
    ],
    synchronize: false,
    extra: { max: 10 },
  };
}

export default new DataSource(buildDataSourceOptions());
