import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitTrackingIndexes1792800000000 implements MigrationInterface {
  name = 'AddVisitTrackingIndexes1792800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_visits_scheduled_at" ON "visits" ("scheduled_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_visits_sales_rep_scheduled" ON "visits" ("sales_representative_id", "scheduled_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_follow_ups_visit_completed" ON "follow_ups" ("visit_id", "is_completed")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_follow_ups_visit_completed"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_visits_sales_rep_scheduled"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_visits_scheduled_at"`);
  }
}
