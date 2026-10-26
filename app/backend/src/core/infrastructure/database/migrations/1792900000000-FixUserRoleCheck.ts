import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Corrective migration for databases created with the earlier HU-09 branch.
 *
 * That branch created "user" with CHECK ("role" IN ('ASESOR', 'DIRECTOR')) and
 * recorded migration 1792500000001 as executed. The current definition of that
 * migration uses ('ADVISOR', 'DIRECTOR'), but it never runs again on those
 * databases, so seeding an ADVISOR fails with a CHK_user_role violation.
 *
 * This migration is safe to run on any database:
 * - It does not delete tables or users.
 * - On a fresh database it leaves the constraint exactly as it already is.
 */
export class FixUserRoleCheck1792900000000 implements MigrationInterface {
  name = 'FixUserRoleCheck1792900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The old constraint must go first: it rejects the new ADVISOR value
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "CHK_user_role"`,
    );
    // Existing users keep their account; only the role value is renamed
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'ADVISOR' WHERE "role" = 'ASESOR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "CHK_user_role" CHECK ("role" IN ('ADVISOR', 'DIRECTOR'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'ADVISOR'`,
    );
  }

  public async down(): Promise<void> {
    // Intentionally empty: going back would restore the obsolete ASESOR role.
  }
}
