import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalesRepresentativesTable1792500000000 implements MigrationInterface {
  name = 'CreateSalesRepresentativesTable1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sales_representatives" (
        "sales_representative_id" SERIAL PRIMARY KEY,
        "name" VARCHAR(150) NOT NULL,
        "email" VARCHAR(150) NOT NULL,
        "phone" VARCHAR(20),
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sales_representatives_email" ON "sales_representatives" (LOWER("email"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "sales_representatives"`);
  }
}
