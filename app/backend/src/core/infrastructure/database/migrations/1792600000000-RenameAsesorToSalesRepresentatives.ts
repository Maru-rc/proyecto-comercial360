import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAsesorToSalesRepresentatives1792600000000 implements MigrationInterface {
  name = 'RenameAsesorToSalesRepresentatives1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asesor" RENAME TO "sales_representatives"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "id_asesor" TO "sales_representative_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "nombre" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "correo" TO "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "telefono" TO "phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "estado" TO "status"`,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "asesor_pkey" RENAME TO "sales_representatives_pkey"`,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "UQ_asesor_correo" RENAME TO "UQ_sales_representatives_email"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE IF EXISTS "asesor_id_asesor_seq" RENAME TO "sales_representatives_sales_representative_id_seq"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER SEQUENCE IF EXISTS "sales_representatives_sales_representative_id_seq" RENAME TO "asesor_id_asesor_seq"`,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "UQ_sales_representatives_email" RENAME TO "UQ_asesor_correo"`,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "sales_representatives_pkey" RENAME TO "asesor_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "status" TO "estado"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "phone" TO "telefono"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "email" TO "correo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "name" TO "nombre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME COLUMN "sales_representative_id" TO "id_asesor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_representatives" RENAME TO "asesor"`,
    );
  }
}
