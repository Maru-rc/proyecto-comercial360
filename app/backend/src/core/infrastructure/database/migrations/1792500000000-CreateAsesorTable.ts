import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAsesorTable1792500000000 implements MigrationInterface {
  name = 'CreateAsesorTable1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "asesor" (
        "id_asesor" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(150) NOT NULL,
        "correo" VARCHAR(150) NOT NULL,
        "telefono" VARCHAR(20),
        "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_asesor_correo" ON "asesor" (LOWER("correo"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "asesor"`);
  }
}
