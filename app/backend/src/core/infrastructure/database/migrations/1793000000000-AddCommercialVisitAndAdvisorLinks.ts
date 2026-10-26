import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * HU-13: quotations and orders belong to the visit and the advisor that made
 * them, and record when they were created. The ORM entities already map these
 * columns, but the initial schema
 * never created them, so every /commercial query failed with
 * "column ... does not exist".
 */
export class AddCommercialVisitAndAdvisorLinks1793000000000 implements MigrationInterface {
  name = 'AddCommercialVisitAndAdvisorLinks1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "visit_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "visit_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sales_representative_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Orders that came from a quotation inherit its advisor
    await queryRunner.query(
      `UPDATE "orders" o SET "sales_representative_id" = q."sales_representative_id"
       FROM "quotes" q
       WHERE o."quote_id" = q."quote_id" AND o."sales_representative_id" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_quotes_visit" FOREIGN KEY ("visit_id") REFERENCES "visits"("visit_id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_visit" FOREIGN KEY ("visit_id") REFERENCES "visits"("visit_id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_sales_representative" FOREIGN KEY ("sales_representative_id") REFERENCES "sales_representatives"("sales_representative_id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quotes_sales_rep_date" ON "quotes" ("sales_representative_id", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_sales_rep_date" ON "orders" ("sales_representative_id", "date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_sales_rep_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quotes_sales_rep_date"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_sales_representative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_visit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "FK_quotes_visit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "sales_representative_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "visit_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "visit_id"`,
    );
  }
}
